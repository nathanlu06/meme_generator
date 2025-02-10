import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    def __init__(self):
        # Inference settings
        self.TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
        self.ATOMA_API_KEY = os.getenv("ATOMA_API_KEY")
        self.CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")


settings = Settings()