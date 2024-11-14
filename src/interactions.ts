import { CacheType, ChatInputCommandInteraction, MessagePayload } from "discord.js";
import { playWordle } from "./wordle.js";

export async function handleInteraction(commandName: string, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    console.log(`Received a ${commandName} request from ${interaction.user.tag}.`);
    if(commandName==="wordle") {
        await playWordle(interaction);
    } else if(commandName==="ping") {
        await interaction.reply({content:"Pong", ephemeral: true});
    }
}
