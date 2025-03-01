import os
import random
import asyncio
from typing import List
from telethon import TelegramClient, events, Button
from telethon.errors import SessionPasswordNeededError
from dotenv import load_dotenv
import nest_asyncio

nest_asyncio.apply()

# Load environment variables
load_dotenv()

API_ID = 21782566
API_HASH = '2ea431d7840a2d9ef6c6715bfa4645de'
BOT_TOKEN = '7666210082:AAG30FFCpgQVtvtcKXEp6vi423DhbmlFEMQ'

# Validate environment variables
if not all([API_ID, API_HASH, BOT_TOKEN]):
    raise ValueError("Missing required environment variables (API_ID, API_HASH, or BOT_TOKEN)")

# Bot configuration
BOT_NAME = "TWOTE Wellness Bot"
SESSION_NAME = f"{BOT_NAME}_session"  # Use a unique session name

# Content
WELLNESS_TIPS: List[str] = [
    "Take three deep breaths and center yourself.",
    "Drink water to stay hydrated throughout the day.",
    "Spend 5 minutes practicing mindfulness today.",
    "Meditate to connect with your inner self.",
    "Focus on your third eye chakra for spiritual clarity.",
    "Ground yourself by walking barefoot in nature.",
    "List three things you’re grateful for today."
]

MEDITATION_PROMPTS: List[str] = [
    "Focus on your breath, letting thoughts drift like clouds.",
    "Visualize a bright light at your third eye center.",
    "Chant 'Om' and feel its vibrations resonate.",
    "Scan your body from head to toe, releasing tension.",
    "Imagine a healing white light enveloping you."
]

CHAKRA_INFO = (
    "👁️ *The Third Eye Chakra (Ajna)* 👁️\n\n"
    "Located between your eyebrows, it governs:\n"
    "- Intuition\n- Wisdom\n- Spiritual awareness\n- Inner vision\n\n"
    "*Tip*: Meditate on this chakra to deepen your spiritual connection."
)

# Initialize bot
bot = TelegramClient(SESSION_NAME, int(API_ID), API_HASH)

# Helper function to format messages
def format_message(header: str, body: str) -> str:
    return f"{header}\n\n{body}"

# Command handlers
@bot.on(events.NewMessage(pattern=r"^/start$"))
async def start_handler(event):
    welcome_message = format_message(
        f"🧘‍♀️ Welcome to {BOT_NAME} 🧘‍♂️",
        "I’m here to guide your wellness journey.\n"
        "Available commands:\n"
        "/meditate - Get a meditation prompt\n"
        "/wellness - Receive a wellness tip\n"
        "/chakra - Learn about the third eye chakra\n"
        "/help - Show this menu"
    )
    await event.reply(welcome_message, parse_mode="markdown")

@bot.on(events.NewMessage(pattern=r"^/meditate$"))
async def meditate_handler(event):
    prompt = random.choice(MEDITATION_PROMPTS)
    await event.reply(format_message("🌟 *Meditation Prompt*", prompt), parse_mode="markdown")

@bot.on(events.NewMessage(pattern=r"^/wellness$"))
async def wellness_handler(event):
    buttons = [
        Button.url("Open Wellness Mini App", url="t.me/TWOTE_Bot/wellness")
    ]
    tip = random.choice(WELLNESS_TIPS)
    await event.reply(
        format_message("💫 *Wellness Tip*", tip),
        buttons=buttons,
        parse_mode="markdown"
    )

@bot.on(events.NewMessage(pattern=r"^/chakra$"))
async def chakra_handler(event):
    await event.reply(CHAKRA_INFO, parse_mode="markdown")

@bot.on(events.NewMessage(pattern=r"^/help$"))
async def help_handler(event):
    await start_handler(event)

# Error handling for unknown commands
@bot.on(events.NewMessage)
async def default_handler(event):
    text = event.raw_text.strip()
    if text.startswith("/") and not any(
        text.startswith(cmd) for cmd in ["/start", "/meditate", "/wellness", "/chakra", "/help"]
    ):
        await event.reply(
            format_message(
                "🤔 *Unknown Command*",
                "I didn’t recognize that command. Use /help to see what I can do!"
            ),
            parse_mode="markdown"
        )

# Main function to start the bot
async def main():
    try:
        await bot.start(bot_token=BOT_TOKEN)
        print(f"{BOT_NAME} is running...")
        me = await bot.get_me()
        print(f"Bot username: @{me.username}")
        await bot.run_until_disconnected()
    except Exception as e:
        print(f"Failed to start bot: {e}")
        raise

# Run the bot
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")
