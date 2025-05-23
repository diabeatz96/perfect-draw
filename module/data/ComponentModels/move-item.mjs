import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawMove extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.name = new fields.StringField({ 
      required: true, 
      blank: false, 
      label: "PERFECT_DRAW.Move.name",
      initial: "none" // Source book
    }); // Display name

    schema.description = new fields.HTMLField({ 
      required: true, 
      blank: false, 
      label: "PERFECT_DRAW.Move.description",
      initial: "none" // Source book
    }); // Narrative/mechanical description

    schema.type = new fields.StringField({ 
      required: true, 
      blank: false, 
      label: "PERFECT_DRAW.Move.type",
      initial: "generic" // Move type: Basic, Advanced, etc.
    }); // Move category

    schema.card_game_only = new fields.BooleanField({ 
      required: true, 
      initial: false, 
      label: "PERFECT_DRAW.Move.card_game_only"
    }); // Card combat only?

    schema.roll_stat = new fields.StringField({ 
      required: true, 
      blank: false, 
      label: "PERFECT_DRAW.Move.roll_stat", 
      initial: "passion" // Attribute used for roll
    }); // Attribute used for roll

    schema.outcomes = new fields.SchemaField({
      "high": new fields.HTMLField({ required: false, blank: true, label: "PERFECT_DRAW.Move.outcomes.10plus" }),
      "mid": new fields.HTMLField({ required: false, blank: true, label: "PERFECT_DRAW.Move.outcomes.7_9" }),
      "low": new fields.HTMLField({ required: false, blank: true, label: "PERFECT_DRAW.Move.outcomes.6minus" }),
    }, { label: "PERFECT_DRAW.Move.outcomes" }); // Results of 2d6+stat roll

    schema.specific_effects = new fields.HTMLField({ 
      required: false, 
      blank: true, 
      label: "PERFECT_DRAW.Move.specific_effects" 
    }); // Concrete actions

    schema.card_details = new fields.SchemaField({
      type: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Move.card_details.type" }),
      features: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Move.card_details.features" }),
    }, { required: false, label: "PERFECT_DRAW.Move.card_details" }); // Details about card types (optional)

    schema.associated_abilities = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Move.associated_abilities.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Move.associated_abilities" }
    ); // Linked abilities

    schema.usage_limits = new fields.HTMLField({ 
      required: false, 
      blank: true, 
      label: "PERFECT_DRAW.Move.usage_limits" 
    }); // Usage restrictions

    schema.gimmick_association = new fields.StringField({ 
      required: false, 
      blank: true, 
      label: "PERFECT_DRAW.Move.gimmick_association" 
    }); // Deck gimmick (optional)

    schema.notes = new fields.HTMLField({ 
      required: false, 
      blank: true, 
      label: "PERFECT_DRAW.Move.notes" 
    }); // Context/advice for Judge

    return schema;
  }

    static async findById(id) {
    return game.items?.find(i => i.type === "move" && i.system?.id === id) ?? null;
  }

}