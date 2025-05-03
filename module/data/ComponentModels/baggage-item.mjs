import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawBaggage extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.character_id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Baggage.character_id",
      initial: "unknown"
    }); // Reference to the Player Character ID

    schema.description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Baggage.description",
      initial: "none" // Source book
    }); // Narrative/mechanical description
    
    schema.is_serious = new fields.BooleanField({
      required: true,
      initial: false,
      label: "PERFECT_DRAW.Baggage.is_serious"
    }); // Is this Serious baggage?

    schema.gain_source = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Baggage.gain_source"
    }); // How/when this baggage was gained (optional)

    schema.notes = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Baggage.notes"
    }); // Additional context or notes (optional)

    return schema;
  }

    static async findById(id) {
    return game.items?.find(i => i.type === "baggage" && i.system?.id === id) ?? null;
  }

}