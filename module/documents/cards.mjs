/**
 * Extend the base Cards document for Perfect Draw decks, piles, or hands.
 * @extends {Cards}
 */
export class PerfectDrawCards extends Cards {
  /** @override */
  prepareData() {
    super.prepareData();
    // Add any custom data preparation here
  }

  /** @override */
  prepareBaseData() {
    // Custom base data logic here (if needed)
  }

  /** @override */
  prepareDerivedData() {
    // Custom derived data logic here (if needed)
  }

  /**
   * CCM Integration: Get the corresponding CCM deck object, if any.
   */
  getCCMDeck() {
    if (!game.ccm) return null;
    // Try to match by name or id; adjust as needed for your linking logic
    return game.ccm.getDeck(this.id) || game.ccm.getDeck(this.name);
  }

  /**
   * CCM Integration: Draw cards using CCM API.
   */
  async drawCCMCard({ count = 1, toHand = false, playerId = null } = {}) {
    const ccmDeck = this.getCCMDeck();
    if (!ccmDeck) throw new Error("No CCM deck found for this stack.");
    return await game.ccm.draw(ccmDeck.id, { count, toHand, playerId });
  }

  /**
   * CCM Integration: Shuffle this deck using CCM API.
   */
  async shuffleCCMDeck() {
    const ccmDeck = this.getCCMDeck();
    if (!ccmDeck) throw new Error("No CCM deck found for this stack.");
    return await game.ccm.shuffleDeck(ccmDeck.id);
  }

  /**
   * CCM Integration: Recall all cards to this deck using CCM API.
   */
  async recallAllCCM() {
    const ccmDeck = this.getCCMDeck();
    if (!ccmDeck) throw new Error("No CCM deck found for this stack.");
    return await game.ccm.recallAll(ccmDeck.id);
  }

  /**
   * Example: Add custom roll data or methods as needed.
   */
  getCustomDeckInfo() {
    return {
      cardCount: this.size,
      isDeck: this.type === "deck",
      ccmDeck: this.getCCMDeck(),
      // ...other custom properties
    };
  }
}