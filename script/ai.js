const axios = require('axios');

function convertToBold(text) {
  const boldMap = {
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
    'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
    'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
    'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
    'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
    'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
    'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  };

  return text.split('').map(char => boldMap[char] || char).join('');
}

module.exports.config = {
  name: 'nova',
  version: '1.0.1',
  hasPermission: 0,
  usePrefix: false,
  aliases: ['gpt', 'openai'],
  description: "An AI command powered by GPT-4o.",
  usages: "ai [prompt]",
  credits: 'LorexAi',
  cooldowns: 0,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');
  const uid = event.senderID;

  const isPhoto = event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo";
  
  if (isPhoto) {
    const photoUrl = event.messageReply.attachments[0].url;

    if (!input) {
      return api.sendMessage(
        "Please provide a prompt along with the image (e.g., 'ai describe this image').",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage("🔄 Analyzing image...", event.threadID, event.messageID);

    try {
      const { data } = await axios.get('https://gpt.lorex-ai.com/api/gemini-vision', {
        params: {
          q: input,
          uid: uid,
          imageUrl: photoUrl
        }
      });

      if (data && data.response) {
        return api.sendMessage(data.response, event.threadID, event.messageID);
      } else {
        return api.sendMessage("Unexpected response format from the image analysis API.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Error processing image analysis request:", error.message || error);
      api.sendMessage("An error occurred while processing the image. Please try again.", event.threadID, event.messageID);
    }

    return;
  }

  if (!input) {
    return api.sendMessage(
      "👋Hey User My name is 𝗡𝗼𝘃𝗮 𝗔𝗶 how can i help you today?",
      event.threadID,
      event.messageID
    );
  }

  api.sendMessage("🔄 Generating...", event.threadID, event.messageID);

  try {
    const { data } = await axios.get('https://rapido.zetsu.xyz/api/gpt4o-mini', {
      params: {
        prompt: input
      }
    });

    if (!data || !data.response) {
      return api.sendMessage("Sorry, I didn't quite catch that. Could you please try asking again?", event.threadID, event.messageID);
    }

    const formattedResponse = data.response
      .replace(/\*\*(.*?)\*\*/g, (_, text) => convertToBold(text))
      .replace(/##(.*?)##/g, (_, text) => convertToBold(text))
      .replace(/###\s*/g, '')
      .replace(/\n{3,}/g, '\n\n');

    return api.sendMessage(formattedResponse, event.threadID, event.messageID);

  } catch (error) {
    console.error("❎
Error processing request:", error.message || error);
    return api.sendMessage(error.message);
  }
};