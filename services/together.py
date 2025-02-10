from together import Together
import os
from configs import settings


INFERENCE_ENDPOINT = "https://api.together.xyz/v1"

INFERENCE_MODEL = "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo"

INFERENCE_KEY = settings.TOGETHER_API_KEY


client = Together(base_url=INFERENCE_ENDPOINT, api_key=INFERENCE_KEY)


def image_gen(prompt = ""):
    response = client.images.generate(
        prompt=prompt,
        model="black-forest-labs/FLUX.1-dev",
        response_format="b64_json",
        width=512,
        height=512,
        # steps=12
    )
    return response

