from openai import OpenAI
from configs import settings
import os


INFERENCE_ENDPOINT = "https://api.atoma.network/v1"

INFERENCE_MODEL = "meta-llama/Llama-3.3-70B-Instruct"

INFERENCE_KEY = settings.ATOMA_API_KEY


client = OpenAI(base_url=INFERENCE_ENDPOINT, api_key=INFERENCE_KEY)

model_name = INFERENCE_MODEL


def inference_fn(chat=[]):
    completion = client.chat.completions.create(
        model=model_name,
        messages=chat,
        # max_tokens=100,
        top_p=0.6,
    )
    return completion.choices[0].message.content