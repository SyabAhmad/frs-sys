import os
import numpy as np
import cv2
import uuid
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv
import face_recognition
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import Model

# Load environment variables
load_dotenv()

class FaceEmbeddingService:
    def __init__(self):
        # Get configuration from environment variables
        self.qdrant_jwt_token = os.getenv('QDRANT_JWTACCESSTOKEN')

        if not self.qdrant_jwt_token:
            raise ValueError("QDRANT_JWTACCESSTOKEN not found in environment variables")

        self.collection_name = "face_embeddings"
        self.vector_size = 1280  # EfficientNetB0 output size

        # Load EfficientNetB0 model for embeddings
        base_model = EfficientNetB0(weights='imagenet', include_top=False, pooling='avg')
        self.embedding_model = base_model

        # Connect to cloud Qdrant using JWT token
        self.client = QdrantClient(
            url="https://9167e9a6-e7d0-4a9b-9e14-1440bfca8a7d.us-east-1-0.aws.cloud.qdrant.io",
            api_key=self.qdrant_jwt_token,
            check_compatibility=False
        )

        # Ensure collection exists
        self._ensure_collection_exists()

        print("Successfully connected to cloud Qdrant instance")

    def _ensure_collection_exists(self):
        try:
            try:
                health = self.client.http.health_api.health_get().result
                print(f"Qdrant health check: {health}")
            except Exception as e:
                print(f"Warning: Health check failed: {e}")

            collections = self.client.get_collections().collections
            collection_names = [collection.name for collection in collections]

            if self.collection_name not in collection_names:
                print(f"Creating new collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                print(f"Created new collection: {self.collection_name}")
            else:
                print(f"Collection {self.collection_name} already exists")

        except Exception as e:
            print(f"Error connecting to Qdrant: {e}")
            print("\nPlease check:")
            print("1. Your Qdrant URL is correct")
            print("2. Your JWT token has proper permissions")
            print("3. Your network allows connections to the Qdrant service")
            print("\nTrying fallback to local mode...")

            try:
                print("Attempting to connect to local Qdrant instance...")
                self.client = QdrantClient(":memory:")
                self.client.recreate_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                print("Successfully connected to local in-memory Qdrant instance")
            except Exception as e2:
                print(f"Failed to create local instance: {e2}")
                raise e

    def generate_embedding(self, image_data):
        try:
            rgb_image = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_image)

            if not face_locations:
                print("⚠️ No face detected!")
                return None

            top, right, bottom, left = face_locations[0]
            face = rgb_image[top:bottom, left:right]

            face = cv2.resize(face, (224, 224))
            face_array = img_to_array(face)
            face_array = np.expand_dims(face_array, axis=0)
            face_array = preprocess_input(face_array)

            embedding = self.embedding_model.predict(face_array)[0]
            embedding = embedding / np.linalg.norm(embedding)

            return embedding.tolist()

        except Exception as e:
            print(f"🔥 Error during embedding: {e}")
            return None

    def store_embedding(self, embedding, user_data):
        embedding_id = str(uuid.uuid4())

        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=embedding_id,
                        vector=embedding,
                        payload={
                            "user_id": user_data.get("user_id"),
                            "name": user_data.get("name"),
                            "email": user_data.get("email"),
                            "department": user_data.get("department")
                        }
                    )
                ]
            )

            print(f"Successfully stored embedding with ID: {embedding_id}")
            return embedding_id

        except Exception as e:
            print(f"Error storing embedding: {e}")
            raise

    def search_similar_faces(self, embedding, threshold=0.7, limit=1):
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=embedding,
                limit=limit
            )

            filtered_results = [
                result for result in results
                if (1 - result.score) >= threshold
            ]

            return filtered_results

        except Exception as e:
            print(f"Error searching faces: {e}")
            raise

    def delete_embedding(self, embedding_id):
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=[embedding_id]
                )
            )
            return True
        except Exception as e:
            print(f"Error deleting embedding: {e}")
            return False
