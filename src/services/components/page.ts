import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessagePayload,
  WebhookEditMessageOptions,
  CommandInteraction,
  CacheType
} from 'discord.js';
import IPageComponent from '../../interfaces/pageComponent';

import Page from '../../utils/page';

abstract class AbstractPageComponent<T> extends Page<T> implements IPageComponent {
  protected message: CommandInteraction<CacheType>;

  protected previousId: string = 'previous';
  protected nextId: string = 'next';

  constructor(maxLines: number = 10) {
    super(maxLines);
  }

  setMessage(message: CommandInteraction<CacheType>): this {
    this.message = message;
    
    return this;
  }

  protected createButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(this.previousId)
					.setStyle(
            this.hasPrevious()
              ? ButtonStyle.Secondary
              : ButtonStyle.Danger
          )
          .setEmoji('⬅️'),
        new ButtonBuilder()
					.setCustomId(this.nextId)
					.setStyle(
            this.hasNext()
              ? ButtonStyle.Secondary
              : ButtonStyle.Danger
          )
          .setEmoji('➡️'),
			);
  }

  createEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  protected createOptions()
  : string | MessagePayload | WebhookEditMessageOptions {
    return {
      embeds: [ this.createEmbed() ],
      components: [ this.createButtons() ]
    };
  }

  async collect() {
    const collector = this.message.channel.createMessageComponentCollector(
      {
        time: 1000 * 60
      }
    );

    collector.on('collect', async i => {
      if (i.user.id !== this.message.member.user.id) {
        return;
      }

      switch (i.customId) {
        case this.previousId:
          this.previous()
          break;
        case this.nextId:
          this.next();
          break;
        default:
          break;
      }

      try {
        await i.deferUpdate();
      } catch (e) {
        // Log if error
      }
      await i.editReply(this.createOptions());
      
    });
  }

  async reply() {
    await this.message.reply(this.createOptions());
  }
}

export default AbstractPageComponent;
