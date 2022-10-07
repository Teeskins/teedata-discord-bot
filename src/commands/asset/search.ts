import {
  APIEmbedField,
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  EmbedBuilder,
  Message,
} from 'discord.js';
  
import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';
import AbstractPageComponent from '../../services/components/page';
import Teedata from '../../services/apis/teedata';
import capitalize from '../../utils/capitalize';
import ErrorEmbed from '../../utils/msg';

type SearchResult = {
  id: number;
  name: string;
  type: string;
  author: string
};

class SearchPageComponent 
extends AbstractPageComponent<SearchResult> {
  private readonly keyword: string;

  constructor(keyword: string) {
    super();

    this.keyword = keyword;
  }

  private autoCreateFields(): APIEmbedField[] {
    const currentContent = this.getCurrentContent();
    const model = currentContent[0] || [];

    return Object.keys(model).map(name => {
      return {
        name: capitalize(name),
        value: currentContent.map(content => { 
          return content[name].toString()
        }).join('\n'),
        inline: true
    };
    });
  }

  createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(this.keyword)
      .setColor(0x000000)
      .addFields(this.autoCreateFields()
      )
      .setFooter(
        {
          text: 'Page ' + this.pageNumber + ' / ' + this.pageMax
        }
      );
  }

  async reply() {
    await this.message.followUp(this.createOptions());
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
    this.description = 'Find every asset containing a keyword';
    this.options = [
      {
        name: 'keyword',
        type: ApplicationCommandOptionType.String,
        required: true,
        description: 'The keyword to search inside the assets name',
        minLength: 3,
        maxLength: 10
      }
    ];
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ keyword ] = args.map(x => x.value.toString());
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply({ ephemeral: true });

    const searchResult = await Teedata.assetSearch(keyword);

    if (searchResult === null) {
      await interaction.followUp({ embeds: [ ErrorEmbed.notFound() ]});
      return;
    }

    const results = searchResult.map((result: SearchResult) => {
        return {
          id: '**' + result.id + '**',
          name: result.name,
          type: result.type
        };
    });

    const component = new SearchPageComponent(keyword)
      .setMaxLines(10)
      .setMessage(interaction)
      .addContent(results);
  
    await component.collect();
    await component.reply();
  };
}
  