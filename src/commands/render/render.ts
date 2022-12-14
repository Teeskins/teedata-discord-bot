import {
  ApplicationCommandOption,
  ApplicationCommandOptionType,
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
  Message,
  EmbedBuilder,
  AttachmentBuilder
} from 'discord.js';

import { v4 as uuidv4 } from 'uuid';

import { Bot } from '../../bot';
import ICommand from '../../interfaces/command';

import Teedata from '../../services/apis/teedata';
import TwUtils from '../../services/apis/twutils';
import ErrorEmbed from '../../utils/msg';

import { files } from '../../utils/files';
import parseCommandOptions from '../../utils/commandOptions';

const eyesArgument: any = {
  name: 'eyes',
  type: ApplicationCommandOptionType.String,
  required: false,
  description: 'The skin eyes state',
  choices: [
    {
      name: 'default',
      value: 'default_eye'
    }, 
    {
      name: 'angry',
      value: 'angry_eye'
    },
    {
      name: 'blink',
      value: 'blink_eye'
    },
    {
      name: 'happy',
      value: 'happy_eye'
    },
    {
      name: 'cross',
      value: 'cross_eye'
    },
    {
      name: 'scary',
      value: 'scary_eye'
    }
  ]
};

export default class implements ICommand {
  name: string;
  category: string;
  description: string;
  extraDescription: string;
  options: ApplicationCommandOption[];
    
  constructor() {
    this.name = 'render';
    this.category = 'render';
    this.description = 'Render a Teeworlds skin';
    this.extraDescription = 'Color modes formats'
    this.options = [
      {
        name: 'custom',
        description: 'Render a Teeworlds skin with custom colors',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'id',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'The skin id',
          },
          {
            name: 'mode',
            type: ApplicationCommandOptionType.String,
            description: 'The skin color mode',
            required: true,
            choices: [
              {
                name: 'rgb',
                value: 'rgb',
                
              }, 
              {
                name: 'hsl',
                value: 'hsl'
              },
              {
                name: 'code',
                value: 'code',
              }
            ]
          },
          {
            name: 'body',
            type: ApplicationCommandOptionType.String,
            description: 'The skin body color',
            required: true
          },
          {
            name: 'feet',
            type: ApplicationCommandOptionType.String,
            description: 'The skin feet color',
            required: true
          },
          eyesArgument
        ]
      },

      {
        name: 'default',
        description: 'Render a Teeworlds skin',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'id',
            type: ApplicationCommandOptionType.String,
            required: true,
            description: 'The skin id',
          },
          eyesArgument
        ]
      }
    ];
  }

  async run(
    _bot: Bot,
    message: Message<boolean> | CommandInteraction<CacheType>,
    args: Array<CommandInteractionOption>
  ) {
    const [ subCommand ] = args;

    const options = parseCommandOptions(subCommand);
    const interaction = message as CommandInteraction<CacheType>;

    await interaction.deferReply({ ephemeral: true });

    // Get skins info
    const info = await Teedata.assetInfo(options.id);

    if (info === null || info.type !== 'skin') {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('This is not a skin id') ]
      });
      return;
    }

    const skinUrl = process.env.TEEDATA_HOST + info.path;

    // Raw bytes PNG
    let imageRawBytes: Uint8Array | null;
    const eye = options.eyes || 'default_eye';
  
    if (subCommand.name === 'custom') {
      imageRawBytes = await TwUtils.renderSkinColor(
        {
          skin: skinUrl,
          eye,
          bcolor: options.body,
          fcolor: options.feet,
          mode: options.mode
        }
      );
    } else {
      imageRawBytes = await TwUtils.renderSkin(
        {
          skin: skinUrl,
          eye
        }
      );
    }

    if (imageRawBytes === null ) {
      await interaction.followUp({
        embeds: [ ErrorEmbed.wrong('Invalid color, check `/help render`') ]
      });
      return;
    }

    const path = uuidv4() + '.png';

    files.write(path, imageRawBytes);

    const file = new AttachmentBuilder(path);
    const embed = new EmbedBuilder()
      .setTitle(info.name)
      .setURL(skinUrl)
      .setImage('attachment://' + path)
      .setColor(0x000000);

    await interaction.followUp(
      {
        embeds: [ embed ],
        files: [ file ]
      }
    );

    files.delete(path);
  };
}
  