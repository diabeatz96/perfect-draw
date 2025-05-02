import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawPlaybook extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.id"
    }); // Unique identifier

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.name"
    }); // Display name

    schema.description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.description"
    }); // Narrative concept/theme

    schema.example_archetypes = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.example_archetypes.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Playbook.example_archetypes" }
    ); // Character concept suggestions

    schema.look_suggestions = new fields.SchemaField({
      hair: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.look_suggestions.hair.item" }),
        { required: false, initial: [], label: "PERFECT_DRAW.Playbook.look_suggestions.hair" }
      ),
      clothes: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.look_suggestions.clothes.item" }),
        { required: false, initial: [], label: "PERFECT_DRAW.Playbook.look_suggestions.clothes" }
      ),
      game_tools: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.look_suggestions.game_tools.item" }),
        { required: false, initial: [], label: "PERFECT_DRAW.Playbook.look_suggestions.game_tools" }
      ),
      other: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.look_suggestions.other.item" }),
        { required: false, initial: [], label: "PERFECT_DRAW.Playbook.look_suggestions.other" }
      )
    }, { required: false, label: "PERFECT_DRAW.Playbook.look_suggestions" }); // Appearance suggestions

    schema.initial_stats = new fields.SchemaField({
      passion: new fields.NumberField({ required: false, label: "PERFECT_DRAW.Playbook.initial_stats.passion" }),
      skill: new fields.NumberField({ required: false, label: "PERFECT_DRAW.Playbook.initial_stats.skill" }),
      friendship: new fields.NumberField({ required: false, label: "PERFECT_DRAW.Playbook.initial_stats.friendship" })
    }, { required: false, label: "PERFECT_DRAW.Playbook.initial_stats" }); // Starting stats

    schema.initial_stat_rule_description = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Playbook.initial_stat_rule_description"
    }); // Stat rules if not standard

    schema.struggles_questions = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.struggles_questions.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Playbook.struggles_questions" }
    ); // Struggles questions

    schema.friends_questions = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.friends_questions.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Playbook.friends_questions" }
    ); // Friends questions

    schema.initial_abilities = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.initial_abilities.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Playbook.initial_abilities" }
    ); // Starting abilities

    schema.available_abilities = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Playbook.available_abilities.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Playbook.available_abilities" }
    ); // Playbook-unique abilities

    schema.starting_staple_id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.starting_staple_id"
    }); // Playbook staple

    schema.initial_generic_staple_count = new fields.NumberField({
      required: true,
      label: "PERFECT_DRAW.Playbook.initial_generic_staple_count"
    }); // Generic staples count

    schema.baggage_rule_description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.baggage_rule_description"
    }); // Baggage rules

    schema.deck_rule_description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Playbook.deck_rule_description"
    }); // Deck rules

    schema.unique_mechanics = new fields.SchemaField({
      has_destruction_track: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_destruction_track" }),
      has_alignment_track: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_alignment_track" }),
      has_prep_resource: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_prep_resource" }),
      has_lessons_mechanic: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_lessons_mechanic" }),
      has_terrible_things_mechanic: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_terrible_things_mechanic" }),
      is_crew_playbook: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.is_crew_playbook" }),
      is_other_me_playbook: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.is_other_me_playbook" }),
      requires_host_playbook: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.requires_host_playbook" }),
      has_multiple_personas: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_multiple_personas" }),
      has_protege: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_protege" }),
      has_pet_option: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_pet_option" }),
      has_contacts_option: new fields.BooleanField({ required: false, initial: false, label: "PERFECT_DRAW.Playbook.unique_mechanics.has_contacts_option" })
    }, { required: false, label: "PERFECT_DRAW.Playbook.unique_mechanics" }); // Playbook-specific mechanics

    schema.advancement_notes = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Playbook.advancement_notes"
    }); // Advancement rules

    schema.judge_advice = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Playbook.judge_advice"
    }); // Judge guidance

    return schema;
  }

    static async findById(id) {
    return game.items?.find(i => i.type === "playbook" && i.system?.id === id) ?? null;
  }

}