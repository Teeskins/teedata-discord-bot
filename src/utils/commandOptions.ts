import {
  CacheType,
  CommandInteractionOption
} from 'discord.js';

type ParsedOptions = {[key: string]: any};

function parseCommandOptions(
  command: CommandInteractionOption<CacheType>
): ParsedOptions {
  let options = {};

  if (command.options === null) {
    return options;
  }

  for (const option of command.options) {
    options[option.name] = option.value;
  }

  return options;
}

export default parseCommandOptions;
