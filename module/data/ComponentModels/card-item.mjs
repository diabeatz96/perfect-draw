import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawCard extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Card.id"
    }); // Unique identifier

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Card.name"
    }); // Display name

    schema.type = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Card.type"
    }); // Card type: Warrior, Item, Invocation

    schema.strength = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.strength"
    }); // Power level: Weak, Normal, Strong, or null

    schema.is_ace = new fields.BooleanField({
      required: true,
      initial: false,
      label: "PERFECT_DRAW.Card.is_ace"
    }); // Is this the {Ace} card?

    schema.keywords = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Card.keywords.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Card.keywords" }
    ); // Keyword IDs

    schema.effect_text = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Card.effect_text"
    }); // Card effect description

    schema.weakness_text = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.weakness_text"
    }); // Card weaknesses

    schema.type_attributes = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Card.type_attributes.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Card.type_attributes" }
    ); // Optional categories

    schema.ribbon_effect_text = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.ribbon_effect_text"
    }); // Unusual/complicated effects

    schema.ep_cost = new fields.NumberField({
      required: true,
      label: "PERFECT_DRAW.Card.ep_cost"
    }); // Total Effect Point cost

    schema.base_ep = new fields.NumberField({
      required: true,
      label: "PERFECT_DRAW.Card.base_ep"
    }); // Base Effect Points

    schema.source_playbook_id = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.source_playbook_id"
    }); // Playbook origin (optional)

    schema.mini_deck_name = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.mini_deck_name"
    }); // Mini-deck name (optional)

    schema.retheme_description = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Card.retheme_description"
    }); // Narrative/flavor customization (optional)

    return schema;
  }

    static async findById(id) {
    return game.items?.find(i => i.type === "card" && i.system?.id === id) ?? null;
  }
  
}