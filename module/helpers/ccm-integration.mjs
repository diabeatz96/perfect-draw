/**
 * Helper functions for integrating Perfect Draw with Complete Card Management (CCM).
 * These functions assume Foundry VTT v11+ and CCM installed/enabled.
 */
export const CCMIntegration = {
  /**
   * Get a deck by its ID.
   * @param {string} deckId
   * @returns {Cards|null}
   */
  getDeck(deckId) {
    return game.cards.get(deckId) ?? null;
  },

  /**
   * Create a new card in a CCM deck with Perfect Draw flags.
   * @param {string} deckId - The ID of the CCM deck.
   * @param {object} cardData - Data for the card (see below for structure).
   * @returns {Promise<Card>}
   */
  async createPerfectDrawCard(deckId, cardData) {
    const deck = this.getDeck(deckId);
    if (!deck) throw new Error(`Deck not found: ${deckId}`);
    return await deck.createCard({
      name: cardData.name,
      img: cardData.img || "icons/svg/card-back.svg",
      type: "card",
      flags: {
        "perfect-draw": {
          type: cardData.type || "generic",
          strength: cardData.strength ?? "Normal",
          is_ace: !!cardData.is_ace,
          keywords: cardData.keywords ?? [],
          effect_text: cardData.effect_text ?? "",
          weakness_text: cardData.weakness_text ?? "",
          type_attributes: cardData.type_attributes ?? [],
          ribbon_effect_text: cardData.ribbon_effect_text ?? "",
          ep_cost: cardData.ep_cost ?? 0,
          base_ep: cardData.base_ep ?? 0,
          source_playbook_id: cardData.source_playbook_id ?? "",
          mini_deck_name: cardData.mini_deck_name ?? "",
          retheme_description: cardData.retheme_description ?? ""
        }
      }
    });
  },

  /**
   * Create a new staple card in a CCM deck.
   * @param {string} deckId
   * @param {object} stapleData
   * @returns {Promise<Card>}
   */
  async createStapleCard(deckId, stapleData) {
    const deck = this.getDeck(deckId);
    if (!deck) throw new Error(`Deck not found: ${deckId}`);
    return await deck.createCard({
      name: stapleData.name,
      img: stapleData.img || "icons/svg/card-back.svg",
      type: "card",
      flags: {
        "perfect-draw": {
          description: stapleData.description ?? "",
          type: stapleData.type ?? "generic",
          source_playbook_id: stapleData.source_playbook_id ?? "",
          keywords: stapleData.keywords ?? [],
          limitations: stapleData.limitations ?? [],
          energy_cost_equivalent: stapleData.energy_cost_equivalent ?? 0
        }
      }
    });
  },

  /**
   * Find all CCM decks with a specific Perfect Draw flag value.
   * @param {string} flagKey
   * @param {any} flagValue
   * @returns {Cards[]}
   */
  findDecksByPerfectDrawFlag(flagKey, flagValue) {
    return game.cards.filter(deck =>
      deck.flags?.["perfect-draw"] &&
      deck.flags["perfect-draw"][flagKey] === flagValue
    );
  },

  /**
   * Get all cards in a deck with a specific Perfect Draw type.
   * @param {string} deckId
   * @param {string} type
   * @returns {Card[]}
   */
  getCardsByPerfectDrawType(deckId, type) {
    const deck = this.getDeck(deckId);
    if (!deck) return [];
    return deck.cards.filter(card =>
      card.flags?.["perfect-draw"]?.type === type
    );
  },

  /**
   * Update a card's Perfect Draw flags.
   * @param {string} cardId
   * @param {object} flagData
   * @returns {Promise<Card>}
   */
  async updatePerfectDrawCardFlags(cardId, flagData) {
    const card = game.cards.contents.flatMap(deck => deck.cards).find(c => c.id === cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);
    return await card.update({ [`flags.perfect-draw`]: flagData });
  },

  /**
   * Delete a card from a deck.
   * @param {string} deckId
   * @param {string} cardId
   * @returns {Promise<void>}
   */
  async deleteCardFromDeck(deckId, cardId) {
    const deck = this.getDeck(deckId);
    if (!deck) throw new Error(`Deck not found: ${deckId}`);
    return await deck.deleteCard(cardId);
  }
};