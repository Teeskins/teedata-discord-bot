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
import AbstractPageComponent from '../../services/components/page';
import Teedata from '../../services/apis/teedata';

type SearchResult = {
  id: number;
  name: string;
  type: string;
  author: string
};

class SearchPageComponent 
extends AbstractPageComponent<SearchResult> {
  constructor() {
    super();
  }
}
    
export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'search';
    this.category = 'asset';
    this.description = 'Find every asset containing `name`';
    this.options = [
      {
        name: 'name',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The asset\'s name'
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
        content: 'search'
      }
    );
  };
}
  