from PIL import Image
import numpy as np
import io
import base64

def save_image(image_data, file_path):
    """Save image data to disk"""
    try:
        # If image_data is a numpy array
        if isinstance(image_data, np.ndarray):
            Image.fromarray(image_data).save(file_path)
        # If image_data is a PIL Image
        elif hasattr(image_data, 'save'):
            image_data.save(file_path)
        # If image_data is bytes or base64
        elif isinstance(image_data, (bytes, str)):
            if isinstance(image_data, str):
                # Remove data URL prefix if present
                if ',' in image_data:
                    image_data = image_data.split(',', 1)[1]
                # Decode base64
                image_data = base64.b64decode(image_data)
            
            Image.open(io.BytesIO(image_data)).save(file_path)
            
        return file_path
    except Exception as e:
        print(f"Error saving image: {e}")
        return None

def process_image_from_request(request):
    """Process image from request (either file upload or base64)"""
    user_data = {}
    image_data = None
    
    # Process form data or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle form data
        user_data = {
            'full_name': request.form.get('name'),
            'email': request.form.get('email'),
            'department': request.form.get('department'),
            'occupation': request.form.get('occupation'),
            'gender': request.form.get('gender'),
            'details': request.form.get('details'),
        }
        
        # Handle image file
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                # Convert to numpy array
                image = Image.open(file.stream)
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image_data = np.array(image)
    else:
        # Handle JSON data
        try:
            data = request.get_json()
            if data:
                user_data = {
                    'full_name': data.get('name'),
                    'email': data.get('email'),
                    'department': data.get('department'),
                    'occupation': data.get('occupation'),
                    'gender': data.get('gender'),
                    'details': data.get('details'),
                }
                
                # Handle base64 image
                if data.get('image'):
                    base64_image = data.get('image')
                    # Remove data URL prefix if present
                    if ',' in base64_image:
                        base64_image = base64_image.split(',', 1)[1]
                        
                    # Convert to numpy array
                    image_bytes = base64.b64decode(base64_image)
                    image = Image.open(io.BytesIO(image_bytes))
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    image_data = np.array(image)
        except Exception as e:
            print(f"Error processing JSON data: {e}")
            
    return user_data, image_data