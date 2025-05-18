import os
import numpy as np
import logging
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image as keras_image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import cv2
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Try to import Qdrant client - with fallback if not available
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models
    from qdrant_client.http.exceptions import UnexpectedResponse
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    print("Qdrant client not available. Using fallback storage.")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceEmbeddingService:
    """Service for generating and storing face embeddings"""
    
    def __init__(self):
        self.embedding_dim = 1280  # MobileNetV2 output dimension
        self.collection_name = "face_embeddings"
        self.model = None
        self.client = None
        self.face_cascade = None
        self.use_fallback = False
        self.embeddings_storage = {}  # Fallback in-memory storage
        
        # Initialize OpenCV face detector
        self._init_face_detector()
        
        # Try to connect to Qdrant
        if QDRANT_AVAILABLE:
            try:
                # Get Qdrant cloud details from environment variables
                qdrant_api_key = os.getenv('QDRANT_APIKEY')
                cluster_id = os.getenv('CLUSTER_ID')
                
                # Construct Qdrant Cloud URL
                qdrant_url = f"https://{cluster_id}.eu-west-1-0.aws.cloud.qdrant.io:6333"
                
                logger.info(f"Connecting to Qdrant Cloud at {qdrant_url}")
                
                # Create the client using cloud URL and API key
                self.client = QdrantClient(
                    url=qdrant_url,
                    api_key=qdrant_api_key,
                )
                
                # Test connection
                collections = self.client.get_collections()
                logger.info(f"Successfully connected to Qdrant Cloud. Collections: {[c.name for c in collections.collections]}")
                
                # Create collection if it doesn't exist
                self._create_collection_if_not_exists()
            except Exception as e:
                logger.error(f"Failed to connect to Qdrant Cloud: {e}")
                logger.info("Falling back to in-memory storage")
                self.use_fallback = True
                self.client = None
        else:
            logger.info("Qdrant client not available. Using in-memory storage.")
            self.use_fallback = True
            
        logger.info("Face Embedding Service initialized")
    
    def _init_face_detector(self):
        """Initialize the OpenCV face detector"""
        try:
            # Load OpenCV's Haar Cascade classifier for face detection
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            logger.info("OpenCV Face Detector initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing face detector: {e}")
            self.face_cascade = None
            
    def detect_and_crop_face(self, image_data):
        """
        Detect faces in the image and return the largest face
        
        Args:
            image_data: np.ndarray containing image data (BGR format)
            
        Returns:
            Cropped face image or original image if no face detected
        """
        try:
            if self.face_cascade is None:
                logger.warning("Face detector not initialized")
                return image_data
                
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image_data, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            if len(faces) == 0:
                logger.warning("No faces detected in image")
                return image_data
                
            logger.info(f"Detected {len(faces)} faces in image")
            
            # Find the largest face
            largest_area = 0
            largest_face = None
            
            for (x, y, w, h) in faces:
                if w*h > largest_area:
                    largest_area = w*h
                    largest_face = (x, y, w, h)
            
            # Add margin around face (20% of face size)
            x, y, w, h = largest_face
            margin_x = int(w * 0.2)
            margin_y = int(h * 0.2)
            
            # Calculate coordinates with margin, ensuring they're within image bounds
            img_h, img_w = image_data.shape[:2]
            x1 = max(0, x - margin_x)
            y1 = max(0, y - margin_y)
            x2 = min(img_w, x + w + margin_x)
            y2 = min(img_h, y + h + margin_y)
            
            # Crop the image to the face region
            cropped_face = image_data[y1:y2, x1:x2]
            
            # Debug info
            original_size = image_data.shape
            cropped_size = cropped_face.shape
            logger.info(f"Cropped face from {original_size} to {cropped_size}")
            
            return cropped_face
            
        except Exception as e:
            logger.error(f"Error detecting/cropping face: {e}", exc_info=True)
            # Return original image if face detection fails
            return image_data
    
    def _create_collection_if_not_exists(self):
        """Create the vector collection if it doesn't exist"""
        try:
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.collection_name not in collection_names:
                logger.info(f"Creating collection '{self.collection_name}'")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.embedding_dim,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Collection '{self.collection_name}' created successfully")
            else:
                logger.info(f"Collection '{self.collection_name}' already exists")
                
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            self.use_fallback = True
    
    def _load_model(self):
        """Load the ML model for generating embeddings"""
        if self.model is None:
            try:
                logger.info("Loading face recognition model...")
                # Use MobileNetV2 as feature extractor
                base_model = MobileNetV2(
                    include_top=False, 
                    weights='imagenet',
                    input_shape=(224, 224, 3),
                    pooling='avg'
                )
                self.model = base_model
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                raise
    
    def generate_embedding(self, image_data):
        """Generate an embedding vector for a face image"""
        try:
            if image_data is None:
                raise ValueError("Image data cannot be None")
            
            # First, detect and crop to just the face
            logger.info("Detecting and cropping face from image")
            face_image = self.detect_and_crop_face(image_data)
            
            # Load the model if not already loaded
            self._load_model()
            
            # Preprocess image for the model
            if isinstance(face_image, np.ndarray):
                # Resize image to model's expected input
                img_array = cv2.resize(face_image, (224, 224))
                
                # Convert BGR to RGB if needed
                if img_array.shape[2] == 3:  # If it's a color image
                    img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
                    
                # Convert to float and add batch dimension
                img_array = np.expand_dims(img_array, axis=0)
                # Preprocess for MobileNetV2
                img_array = preprocess_input(img_array)
            else:
                logger.error("Unsupported image data type")
                return None
                
            # Generate embedding using model
            logger.info("Generating embedding using model")
            embedding = self.model.predict(img_array)[0]
            
            logger.info(f"Generated embedding with shape {embedding.shape}")
            
            # Return as list for JSON serialization
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}", exc_info=True)
            return None
    
    def store_embedding(self, embedding, metadata):
        """Store an embedding in Qdrant Cloud or fallback storage"""
        try:
            if embedding is None:
                raise ValueError("Embedding cannot be None")
            
            # Ensure metadata has valid user_id
            if 'user_id' not in metadata:
                raise ValueError("Metadata must include user_id")
                
            user_id = metadata.get('user_id')
            if not isinstance(user_id, int):
                try:
                    user_id = int(user_id)
                    metadata['user_id'] = user_id
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid user_id: {user_id}")
                    
            # Create a point ID that's unique but deterministic for this user
            numeric_id = int(time.time() * 1000) + user_id
            
            # Store embedding in Qdrant if available
            if not self.use_fallback and self.client:
                logger.info(f"Storing embedding in Qdrant Cloud for user {user_id}")
                try:
                    # Ensure embedding is a list of floats
                    if isinstance(embedding, np.ndarray):
                        embedding = embedding.tolist()
                    
                    # Log embedding type and first few values for debugging
                    logger.info(f"Embedding type: {type(embedding)}")
                    logger.info(f"Sample values: {embedding[:5]}")
                    
                    # Insert the point into the collection
                    operation_info = self.client.upsert(
                        collection_name=self.collection_name,
                        points=[
                            models.PointStruct(
                                id=numeric_id,  # Use numeric ID for Qdrant Cloud
                                vector=embedding,
                                payload=metadata
                            )
                        ]
                    )
                    logger.info(f"Successfully stored embedding in Qdrant Cloud with ID {numeric_id}")
                    logger.info(f"Operation status: {operation_info}")
                    
                    return str(numeric_id)  # Return ID as string for consistency
                    
                except UnexpectedResponse as e:
                    logger.error(f"Qdrant API error: {e}")
                    # Fall back to in-memory storage
                    self.use_fallback = True
                    return self._store_in_memory(str(numeric_id), embedding, metadata)
                except Exception as e:
                    logger.error(f"Error storing in Qdrant: {e}", exc_info=True)
                    # Fall back to in-memory storage
                    self.use_fallback = True
                    return self._store_in_memory(str(numeric_id), embedding, metadata)
            else:
                # Use in-memory storage
                return self._store_in_memory(str(numeric_id), embedding, metadata)
                
        except Exception as e:
            logger.error(f"Error in store_embedding: {e}", exc_info=True)
            return f"error_{int(time.time())}"
    
    def _store_in_memory(self, point_id, embedding, metadata):
        """Store embedding in memory (fallback method)"""
        logger.info(f"Storing embedding in memory with metadata: {metadata}")
        self.embeddings_storage[point_id] = {
            "embedding": embedding,
            "metadata": metadata
        }
        return point_id
    
    def search_similar_faces(self, query_embedding, threshold=0.65, limit=5):
        """Search for similar faces"""
        try:
            if query_embedding is None:
                raise ValueError("Query embedding cannot be None")
                
            # Convert numpy array to list if needed
            if isinstance(query_embedding, np.ndarray):
                query_embedding = query_embedding.tolist()
                
            logger.info(f"Searching for faces with similarity threshold: {threshold}, limit: {limit}")
                
            # Search in Qdrant if available
            if not self.use_fallback and self.client:
                try:
                    # Check if collection exists
                    collections = self.client.get_collections().collections
                    collection_names = [c.name for c in collections]
                    
                    if self.collection_name not in collection_names:
                        logger.warning(f"Collection '{self.collection_name}' does not exist yet")
                        return []
                    
                    # Get collection info to check if it has points
                    collection_info = self.client.get_collection(self.collection_name)
                    if collection_info.vectors_count == 0:
                        logger.warning(f"Collection '{self.collection_name}' is empty")
                        return []
                        
                    logger.info("Searching in Qdrant Cloud")
                    
                    # Debug the query vector format
                    logger.info(f"Query vector type: {type(query_embedding)}")
                    logger.info(f"Query vector length: {len(query_embedding)}")
                    
                    # Adjust score_threshold to be a proper similarity threshold
                    # For Cosine distance, 1.0 means completely different, 0.0 means identical
                    # We convert similarity threshold (0.65) to distance threshold (0.35)
                    distance_threshold = 1.0 - threshold
                    
                    logger.info(f"Using distance threshold: {distance_threshold}")
                    
                    # First try with the threshold to get good matches
                    search_results = self.client.search(
                        collection_name=self.collection_name,
                        query_vector=query_embedding,
                        limit=limit,
                        score_threshold=distance_threshold
                    )
                    
                    # If we didn't get enough results, search again with no threshold
                    if len(search_results) < limit:
                        # Get more results without a threshold
                        all_results = self.client.search(
                            collection_name=self.collection_name,
                            query_vector=query_embedding,
                            limit=limit,
                            score_threshold=None  # No threshold for broader results
                        )
                        # Make sure we don't duplicate results
                        found_ids = {r.id for r in search_results}
                        
                        # Add any results we didn't already have
                        for result in all_results:
                            if result.id not in found_ids and len(search_results) < limit:
                                search_results.append(result)
                                found_ids.add(result.id)
                    
                    logger.info(f"Found {len(search_results)} matches in Qdrant Cloud")
                    
                    # Print details of each result for debugging
                    for i, result in enumerate(search_results):
                        similarity = 1 - result.score
                        logger.info(f"Match {i+1}: id={result.id}, score={result.score}, similarity={similarity:.2f}, payload={result.payload}")
                        
                    return search_results
                except Exception as e:
                    logger.error(f"Error searching in Qdrant: {e}", exc_info=True)
                    # Fall back to in-memory search
                    self.use_fallback = True
        
            # Use in-memory search as fallback
            return self._search_in_memory(query_embedding, threshold, limit)

        except Exception as e:
            logger.error(f"Error in search_similar_faces: {e}", exc_info=True)
            return []

    def _search_in_memory(self, query_embedding, threshold, limit):
        """Search for similar faces in memory (fallback method)"""
        logger.info(f"Searching in memory storage ({len(self.embeddings_storage)} entries)")
        results = []
        
        # Skip if no embeddings stored
        if len(self.embeddings_storage) == 0:
            return []
            
        query_embedding_array = np.array(query_embedding)
        
        # Search through stored embeddings
        for point_id, data in self.embeddings_storage.items():
            stored_embedding = np.array(data["embedding"])
            metadata = data["metadata"]
            
            # Calculate cosine similarity
            norm_q = np.linalg.norm(query_embedding_array)
            norm_s = np.linalg.norm(stored_embedding)
            
            if norm_q == 0 or norm_s == 0:
                similarity = 0
            else:
                similarity = np.dot(query_embedding_array, stored_embedding) / (norm_q * norm_s)
                
            # Convert to distance (0 = identical, 2 = opposite)
            distance = 1.0 - similarity
            
            # If distance is less than threshold, it's a match
            if distance < (1.0 - threshold):
                class SearchResult:
                    def __init__(self, id, payload, score):
                        self.id = id
                        self.payload = payload
                        self.score = score                
                result = SearchResult(point_id, metadata, distance)
                results.append(result)
        
        # Sort by similarity (lowest distance first)
        results.sort(key=lambda x: x.score)
        
        # Limit results
        results = results[:limit]
        
        logger.info(f"Found {len(results)} matches in memory")
        return results

    def list_all_embeddings(self):
        """List all embeddings in Qdrant (for debugging)"""
        if not self.use_fallback and self.client:
            try:
                # Check if collection exists
                collections = self.client.get_collections().collections
                collection_names = [c.name for c in collections]
                
                if self.collection_name not in collection_names:
                    logger.warning(f"Collection '{self.collection_name}' does not exist yet")
                    return []
                
                # Get collection info
                collection_info = self.client.get_collection(self.collection_name)
                logger.info(f"Collection info: {collection_info}")
                
                # Scroll through all points in the collection
                scroll_results = self.client.scroll(
                    collection_name=self.collection_name,
                    limit=100  # Adjust as needed
                )
                
                points = scroll_results[0]  # First element contains the points
                logger.info(f"Found {len(points)} points in collection")
                
                # Extract and return simplified info (without vectors)
                result = []
                for point in points:
                    result.append({
                        "id": point.id,
                        "payload": point.payload
                    })
                
                return result
                
            except Exception as e:
                logger.error(f"Error listing embeddings: {e}", exc_info=True)
                return []
        else:
            # Return in-memory embeddings
            result = []
            for point_id, data in self.embeddings_storage.items():
                result.append({
                    "id": point_id,
                    "payload": data["metadata"]
                })
            return result