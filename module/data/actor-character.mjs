import PerfectDrawActorBase from "./base-actor.mjs";

// Import all relevant data models for integration
import PerfectDrawPlaybook from "./ComponentModels/playbook-item.mjs";
import PerfectDrawAbility from "./ComponentModels/ability-item.mjs";
import PerfectDrawStaple from "./ComponentModels/staple-item.mjs";
import PerfectDrawCard from "./ComponentModels/card-item.mjs";
import PerfectDrawBaggage from "./ComponentModels/baggage-item.mjs";

export default class PerfectDrawCharacter extends PerfectDrawActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Character.id"
    });

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Character.name"
    });

    schema.pronouns = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Character.pronouns"
    });

    schema.playbook = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Character.playbook"
    });

    schema.look = new fields.SchemaField({
      hair: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Character.look.hair" }),
      clothes: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Character.look.clothes" }),
      game_tools: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Character.look.game_tools" }),
      other: new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Character.look.other" })
    }, { required: false, label: "PERFECT_DRAW.Character.look" });

    schema.experience_track = new fields.ArrayField(
      new fields.BooleanField({ required: false, initial: false }),
      { required: false, initial: [], label: "PERFECT_DRAW.Character.experience_track" }
    );

    schema.advancements = new fields.ArrayField(
      new fields.SchemaField({
        type: new fields.StringField({ required: true, blank: false }),
        ref_id: new fields.StringField({ required: false, blank: true }),
        stat: new fields.StringField({ required: false, blank: true })
      }),
      { required: false, initial: [], label: "PERFECT_DRAW.Character.advancements" }
    );

    schema.major_advancements_unlocked = new fields.BooleanField({
      required: false,
      initial: false,
      label: "PERFECT_DRAW.Character.major_advancements_unlocked"
    });

    // These fields are flexible objects, but you should use the imported models for validation/manipulation elsewhere
    schema.stats_data = new fields.SchemaField({}, { required: false, label: "PERFECT_DRAW.Character.stats_data" });
    schema.baggage_data = new fields.SchemaField({}, { required: false, label: "PERFECT_DRAW.Character.baggage_data" });
    schema.deck_details = new fields.SchemaField({}, { required: false, label: "PERFECT_DRAW.Character.deck_details" });

    // Integrate staples as references to Staple model
    schema.staples = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({ required: true, blank: false }),
        name: new fields.StringField({ required: true, blank: false }),
        description: new fields.HTMLField({ required: true, blank: false }),
        is_playbook_staple: new fields.BooleanField({ required: true, initial: false }),
        usage_limit: new fields.StringField({ required: false, blank: true })
      }),
      { required: false, initial: [], label: "PERFECT_DRAW.Character.staples" }
    );

    // Abilities as references to Ability IDs
    schema.abilities = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.Character.abilities" }
    );

    // Playbook-specific mechanics (all optional)
    schema.the_ally_life = new fields.SchemaField({
      career: new fields.StringField({ required: false, blank: true }),
      hobby: new fields.StringField({ required: false, blank: true }),
      important_person: new fields.StringField({ required: false, blank: true }),
      marked_items: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
        { required: false, initial: [] }
      )
    }, { required: false });

    schema.the_destined_destruction_track = new fields.ArrayField(
      new fields.BooleanField({ required: false, initial: false }),
      { required: false, initial: [] }
    );

    schema.the_idealist_ideology = new fields.SchemaField({
      ideal: new fields.StringField({ required: false, blank: true }),
      opposing: new fields.StringField({ required: false, blank: true }),
      current_meaning: new fields.StringField({ required: false, blank: true })
    }, { required: false });

    schema.the_idealist_protege_id = new fields.StringField({ required: false, blank: true });

    schema.the_medium_powers = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [] }
    );

    schema.the_facade_alignment = new fields.SchemaField({
      heroic: new fields.NumberField({ required: false }),
      villainous: new fields.NumberField({ required: false }),
      current_bonus_alignment: new fields.StringField({ required: false, blank: true })
    }, { required: false });

    schema.the_crew_details = new fields.SchemaField({}, { required: false });

    schema.the_mentor_pet = new fields.SchemaField({}, { required: false });

    schema.the_mentor_friends_in_high_places = new fields.SchemaField({}, { required: false });

    schema.the_rogue_silver_bullets_created_ids = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [] }
    );

    schema.the_spirit_spirit_form = new fields.StringField({ required: false, blank: true });

    return schema;
  }

  /**
   * Example: Integrate with data models for validation, population, or transformation.
   * You can use the imported models (PerfectDrawPlaybook, PerfectDrawAbility, etc.)
   * to fetch, validate, or enrich the character's playbook, abilities, staples, cards, etc.
   * For example, when loading a character, you might populate their abilities with
   * full data from the Ability model based on the stored IDs.
   */

  prepareDerivedData() {
    // Example: You could resolve ability IDs to full ability objects here
    // this.abilities = this.abilities.map(id => fetchAbilityById(id));
    // Or resolve playbook, staples, etc.
  }

  getRollData() {
    // Populate roll data as needed for your system
    const data = {};
    return data;
  }
}