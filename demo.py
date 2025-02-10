import gradio as gr
from utils import meme_gen_e2e

# Create Gradio interface
iface = gr.Interface(
    fn=meme_gen_e2e,  # Function to wrap
    inputs=gr.Textbox(lines=2, placeholder="Enter your meme idea here..."),  # Input component
    outputs=[gr.Textbox(label="Meme Info"), gr.Image(label="Meme Image")],  # Output components
    title="Meme Generator",
    description="Enter an idea and generate a meme!"
)

# Launch the interface
iface.launch(share = True)