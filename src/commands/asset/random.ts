import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
} from 'discord.js';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';
  
export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
  
  constructor() {
    this.name = 'random';
    this.category = 'asset';
    this.description = 'Random asset of a category';
    this.options = [
      {
        name: 'category',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset category',
        choices: [
          {
            name: 'skin',
            value: 'skin'
          },
          {
            name: 'mapres',
            value: 'mapres'
          },
          {
            name: 'gameskin',
            value: 'gameskin'
          },
          {
            name: 'emoticon',
            value: 'emoticon'
          },
          {
            name: 'entity',
            value: 'entity'
          },
          {
            name: 'cursor',
            value: 'cursor'
          },
          {
            name: 'particle',
            value: 'particle'
          },
          {
            name: 'font',
            value: 'font'
          },
          {
            name: 'gridTemplate',
            value: 'gridTemplate'
          },
        ]
      }
    ];
  }
  
  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    _args: Array<CommandInteractionOption>
  ) {
      await message.reply(
      {
        content: 'random'
      }
    );
  };
}
