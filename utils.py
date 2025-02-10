from services.atoma import inference_fn
from services.together import image_gen
from services.cloudinary import upload_to_cloudinary

from IPython.display import display


import random
import requests

def story_generator(idea = ""):
    result = inference_fn([
        {
            "role": "system",
            "content": f"""
    Generate a meme based on user idea:
    """
        },
        {
            "role": "user",
            "content": idea
        },
    ])

    print(result)
    return result

def meme_generator(story = ""):
    TONE = random.choice (["STAR TREK", "SCI-FI", "HORROR"])

    token_results = inference_fn([
        {
            "role": "system",
            "content": f"""
    Transform the story of a meme provided by the user into a hilariously absurd and iconic masterpiece of a meme token, following the specified theme:  
    **Theme:** {TONE}

    Your response should embody sharp wit, over-the-top exaggeration, and unapologetic silliness. Ensure the token's image description includes text that reinforces the meme's idea.

    Present the output in JSON format using this structure:  

    ```json
    {{
        "token_name": "<A hilariously creative and iconic less than 25 characters name for the token>",
        "token_symbol": "<A shorthand symbol less than 5 characters for the token (e.g., $BTC, $ETH)>",
        "token_story": "<A wildly exaggerated and comically absurd origin less than 250 characters story for the token>",
        "token_image": "<A vivid and ridiculously silly description of an image inspired by meme culture>"
    }}
    ```

    **Output only the JSON object and nothing else.**

    """
        },
        {
            "role": "user",
            "content": story
        },
    ])

    print(token_results)

    image_gen_prompt = eval(token_results.replace("```json","").replace("```",""))["token_image"]

    response = image_gen(image_gen_prompt)

    # Extract the Base64 string from the response
    image_url = upload_to_cloudinary(response.data[0].b64_json)



    # Display the image
    return eval(token_results.replace("```json","").replace("```","")), image_url




def meme_gen_e2e(idea=""):
    story = story_generator(idea)
    meme_info, meme_image_url = meme_generator(story)
    
    # Return both meme_info and meme_image
    return meme_info, meme_image_url

