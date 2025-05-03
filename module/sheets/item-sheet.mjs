import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class PerfectDrawItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['perfect-draw', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/perfect-draw/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Prepare Linked Abilities

    const uuids = this.item.system.linked_abilities ?? [];
     context.linkedAbilities = [];
    for (let uuid of uuids) {
      try {
        const ability = await fromUuid(uuid);
        if (ability) {
          context.linkedAbilities.push({ name: ability.name, uuid, missing: false });
        } else {
          context.linkedAbilities.push({ name: "Missing Ability", uuid, missing: true });
        }
      } catch (e) {
        context.linkedAbilities.push({ name: "Invalid Reference", uuid, missing: true });
      }
    }

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.PERFECT_DRAW
    context.config = CONFIG.PERFECT_DRAW;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    html.find('.linked-ability').on('click', async ev => {
      const uuid = ev.currentTarget.dataset.uuid;
      const item = await fromUuid(uuid);
      if (item) item.sheet.render(true);
    });

    // Drag-and-drop linking
    html.find('.linked-abilities-dropzone')
      .on('dragover', ev => ev.preventDefault())
      .on('drop', this._onDropAbility.bind(this));
  }

  async _onDropAbility(event) {
    event.preventDefault();
    const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    if (data.type === "Item" && data.uuid) {
      const item = await fromUuid(data.uuid);
      if (item && item.type === "ability") {
        let uuids = this.item.system.linked_abilities ?? [];
        if (!uuids.includes(data.uuid)) {
          uuids = [...uuids, data.uuid];
          await this.item.update({ "system.linked_abilities": uuids });
        }
      }
    }
  }

}
