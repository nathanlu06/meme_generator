from fastapi import FastAPI
from pydantic import BaseModel
from utils import meme_gen_e2e

app = FastAPI()

class MemeInput(BaseModel):
    idea: str

@app.post("/generate-meme")
async def generate_meme(request: MemeInput):
    result = meme_gen_e2e(request.idea)
    return {"meme_info": result[0], "meme_image": result[1]}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6536)