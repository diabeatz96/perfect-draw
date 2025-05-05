export class PerfectDrawCardsSheet extends CardsSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['perfect-draw', 'sheet', 'cards'],
      width: 800,
      height: 600,
      template: 'systems/perfect-draw/templates/cards/cards-sheet.hbs'
    });
  }

  async getData() {
    const context = await super.getData();
    // Add CCM deck info for template use
    context.ccmDeck = this.document.getCCMDeck?.();
    context.ccmCards = context.ccmDeck?.cards ?? [];
    context.isDeck = this.document.type === "deck";
    context.isPile = this.document.type === "pile";
    context.isHand = this.document.type === "hand";
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Example: Shuffle deck button
    html.find('.ccm-shuffle').click(async ev => {
      ev.preventDefault();
      await this.document.shuffleCCMDeck();
      this.render();
    });
    // Example: Draw card button
    html.find('.ccm-draw').click(async ev => {
      ev.preventDefault();
      await this.document.drawCCMCard({ count: 1 });
      this.render();
    });
    // Add more listeners as needed
  }
}