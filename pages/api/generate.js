import { Configuration, OpenAIApi } from "openai";
import {writeFileSync } from 'fs';



const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  var user_prompt = req.body.prompt || '';
  if (user_prompt.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid prompt",
      }
    });
    return;
  }else{
    user_prompt = user_prompt.trim();
  }

  try {
    const completion = await openai.createImage({
      prompt: user_prompt,
      n: 1,
      size: '256x256',
    });
    // console.log(completion.data.data[0].url);
    const img_url = completion.data.data[0].url;
    const response = await fetch(img_url);
    const buffer = await response.arrayBuffer();
    writeFileSync(`./public/${user_prompt}.png`, Buffer.from(buffer));

    res.status(200).json({ result: completion.data.data[0].url});
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
