import { EmbedBuilder } from "discord.js";

enum ErrorMessage {
  WRONG_ERROR_MSG = '⚠️ Something went wrong',
  NOT_FOUND_ERROR_MSG = '☁️ Nothing has not been found',
  MISSING_PERMISSION = '⛔️ Missing permission(s)',
}

class ErrorEmbed {
  static wrong(details: string = ''): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ErrorMessage.WRONG_ERROR_MSG)
      .setDescription(details)
      .setColor(0x000000);
  }

  static notFound(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ErrorMessage.NOT_FOUND_ERROR_MSG)
      .setColor(0x000000);
  }

  static missingPermission(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(ErrorMessage.MISSING_PERMISSION)
      .setColor(0x000000);
  }
}

export default ErrorEmbed;
