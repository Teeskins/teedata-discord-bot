import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message
} from 'discord.js';


import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';

export default class implements ICommand {
  name: String;
  category: String;
  description: String;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'card';
    this.category = 'profile';
    this.description = 'Visualize your Teedata profile public informations';
    this.options = [
      {
        name: 'essential',
        description: 'Only show the essential informations',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'Website username',
          }
        ]
      },
      {
        name: 'full',
        description: 'Show all your information',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'name',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'Website username',
          }
        ]
      }
    ];
  }

  private async essentialCardCommand(
    interaction: CommandInteraction<CacheType>,
    _name: string
  ) {
    await interaction.followUp({
      content: 'essential'
    });
  }

  private async fullCardCommand(
    interaction: CommandInteraction<CacheType>,
    _name: string
  ) {
    await interaction.followUp({
      content: 'full'
    });
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ subCommand ] = args;
    const [ nameArg ] = subCommand.options;
    const name = nameArg.value.toString();
  
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply();

    switch (subCommand.name) {
      case 'essential':
        this.essentialCardCommand(interaction, name);
        break;

      case 'full':
        this.fullCardCommand(interaction, name);
        break;

      default:
        break;
    }
  }
}
    