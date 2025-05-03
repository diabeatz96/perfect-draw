import PerfectDrawActorBase from "./base-actor.mjs";
import PerfectDrawPlaybook from "./ComponentModels/playbook-item.mjs";
import PerfectDrawMove from "./ComponentModels/move-item.mjs";

export default class PerfectDrawNPC extends PerfectDrawActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();


    schema.name = new fields.StringField({
      required: false,
      blank: false,
      label: "PERFECT_DRAW.NPC.name"
    });

    schema.pronouns = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.NPC.pronouns"
    });

    schema.description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.NPC.description",
      initial: "none" // Narrative concept/theme
    });

    schema.gimmick = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.NPC.gimmick"
    });

    schema.establish_plan_moves = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.establish_plan_moves" }
    );

    schema.power_card_moves = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.power_card_moves" }
    );

    schema.simple_card_moves = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.simple_card_moves" }
    );

    schema.response_moves = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.response_moves" }
    );

    schema.threat_moves = new fields.SchemaField({}, { required: false, label: "PERFECT_DRAW.NPC.threat_moves" });

    schema.example_card_names = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.example_card_names" }
    );

    schema.affiliated_organization_id = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.NPC.affiliated_organization_id"
    });

    schema.player_relationships = new fields.ArrayField(
      new fields.SchemaField({
        player_id: new fields.StringField({ required: true, blank: false }),
        type: new fields.StringField({ required: true, blank: false }),
        description: new fields.StringField({ required: false, blank: true })
      }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.player_relationships" }
    );

    schema.npc_relationships = new fields.ArrayField(
      new fields.SchemaField({
        npc_id: new fields.StringField({ required: true, blank: false }),
        type: new fields.StringField({ required: true, blank: false }),
        description: new fields.StringField({ required: false, blank: true })
      }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.npc_relationships" }
    );

    schema.plots = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.plots" }
    );

    schema.specific_playbook_data = new fields.SchemaField({
      is_crew_member: new fields.BooleanField({ required: false, initial: false }),
      crew_stats: new fields.SchemaField({
        Passion: new fields.NumberField({ required: false }),
        Skill: new fields.NumberField({ required: false }),
        Friendship: new fields.NumberField({ required: false })
      }, { required: false }),
      crew_mini_deck_ids: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
        { required: false, initial: [] }
      ),
      is_spirit_host: new fields.BooleanField({ required: false, initial: false }),
      spirit_player_id: new fields.StringField({ required: false, blank: true }),
      crew_temporary_member_skills: new fields.StringField({ required: false, blank: true })
    }, { required: false, label: "PERFECT_DRAW.NPC.specific_playbook_data" });

    // Optional: Reference to playbook or moves by ID
    schema.playbook_id = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.NPC.playbook_id"
    });

    schema.move_ids = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true }),
      { required: false, initial: [], label: "PERFECT_DRAW.NPC.move_ids" }
    );

    return schema;
  }

  async prepareDerivedData() {
    // Optionally resolve playbook and moves
    if (this.playbook_id) {
      this.playbookData = await PerfectDrawPlaybook.findById?.(this.playbook_id) || null;
    }
    if (Array.isArray(this.move_ids)) {
      this.moveData = await Promise.all(
        this.move_ids.map(id => PerfectDrawMove.findById?.(id))
      );
    }
  }
}