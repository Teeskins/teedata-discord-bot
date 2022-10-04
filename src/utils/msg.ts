import { EmbedBuilder } from "discord.js";

enum ErrorMessage {
  WRONG_ERROR_MSG = '⚠️ Something went wrong',
  NOT_FOUND_ERROR_MSG = '☁️ Nothing has not been found',
  MISSING_PERMISSION = '⚠️ You need permission to run this command',
}

class ErrorEmbed {
  static wrong(): EmbedBuilder {
    return new EmbedBuilder()
      .setDescription(ErrorMessage.WRONG_ERROR_MSG)
      .setColor(0x000000);
  }

  static notFound(): EmbedBuilder {
    return new EmbedBuilder()
      .setDescription(ErrorMessage.NOT_FOUND_ERROR_MSG)
      .setColor(0x000000);
  }

  static missingPermission(): EmbedBuilder {
    return new EmbedBuilder()
      .setDescription(ErrorMessage.MISSING_PERMISSION)
      .setColor(0x000000);
  }
}

export default ErrorEmbed;
