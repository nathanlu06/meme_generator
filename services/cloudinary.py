import requests
import base64
from PIL import Image
from io import BytesIO
from configs import settings

def upload_to_cloudinary(image_data):
    image_bytes = base64.b64decode(image_data)
    url = "https://api.cloudinary.com/v1_1/dstqcb0lj/image/upload"
    files = {'file': BytesIO(image_bytes)}
    data = {
        'api_key': '532772445588943',
        'api_secret': settings.CLOUDINARY_API_KEY,
        'upload_preset': 'memegen'
    }

    response = requests.post(url, files=files, data=data)
    image_url = response.json()["secure_url"]
    print(image_url)
    return image_url