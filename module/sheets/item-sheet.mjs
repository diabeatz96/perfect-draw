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
      width: 709,
      height: 675,
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
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.item.getRollData(),
        relativeTo: this.item,
      }
    );

    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = CONFIG.PERFECT_DRAW;
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    // --- Draggable Abilities Logic ---
    // Drag start for abilities
    html.find('.draggable-ability').attr('draggable', true).on('dragstart', ev => {
      const $li = $(ev.currentTarget);
      const index = Number($li.data('index'));
      const type = $li.closest('.draggable-abilities-dropzone').data('type');
      ev.originalEvent.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          action: 'moveAbility',
          index,
          type,
          itemId: this.item.id,
        })
      );
    });

    // Click to open ability sheet
    html.find('.draggable-ability span').on('click', async ev => {
      ev.preventDefault();
      const $li = $(ev.currentTarget).closest('.draggable-ability');
      const type = $li.closest('.draggable-abilities-dropzone').data('type');
      const index = Number($li.data('index'));
      const abilities = Array.from(this.item.system[`${type}_abilities`] ?? []);
      const abilityName = abilities[index];
      if (!abilityName) return;

      // Try to find the ability item by name in the world or compendium
      let abilityItem = game.items?.find(i => i.type === "ability" && i.name === abilityName);
      if (!abilityItem) {
        // Optionally, search compendiums for the ability
        for (let pack of game.packs.filter(p => p.documentName === "Item")) {
          const index = await pack.getIndex();
          const entry = index.find(e => e.name === abilityName && e.type === "ability");
          if (entry) {
            abilityItem = await pack.getDocument(entry._id);
            break;
          }
        }
      }
      if (abilityItem) abilityItem.sheet.render(true);
      else ui.notifications.warn(game.i18n.localize("PERFECT_DRAW.AbilityNotFound") + `: ${abilityName}`);
    });

    // Dropzone for both initial and available abilities
    html.find('.draggable-abilities-dropzone')
      .on('dragover', ev => ev.preventDefault())
      .on('drop', this._onDropAbility.bind(this));

    // Add/Remove for Initial Abilities
    html.find('.add-initial-ability').click(ev => {
      ev.preventDefault();
      this._showAbilityPickerDialog('initial');
    });
    html.find('.remove-initial-ability').click(ev => {
      ev.preventDefault();
      const idx = Number(ev.currentTarget.dataset.index);
      let abilities = Array.from(this.item.system.initial_abilities ?? []);
      abilities.splice(idx, 1);
      this.item.update({ 'system.initial_abilities': abilities });
    });

    // Add/Remove for Available Abilities
    html.find('.add-available-ability').click(ev => {
      ev.preventDefault();
      this._showAbilityPickerDialog('available');
    });
    html.find('.remove-available-ability').click(ev => {
      ev.preventDefault();
      const idx = Number(ev.currentTarget.dataset.index);
      let abilities = Array.from(this.item.system.available_abilities ?? []);
      abilities.splice(idx, 1);
      this.item.update({ 'system.available_abilities': abilities });
    });

    // Add/Remove for example archetypes
    html.find('.add-archetype').click(ev => {
      ev.preventDefault();
      const archetypes = Array.from(this.item.system.example_archetypes ?? []);
      archetypes.push({ label: '' });
      this.item.update({ 'system.example_archetypes': archetypes });
    });
    html.find('.remove-archetype').click(ev => {
      ev.preventDefault();
      const idx = Number(ev.currentTarget.dataset.index);
      let archetypes = Array.from(this.item.system.example_archetypes ?? []);
      archetypes.splice(idx, 1);
      this.item.update({ 'system.example_archetypes': archetypes });
    });

    // Add/Remove for look suggestions (hair, clothes, game_tools, other)
    const lookTypes = ['hair', 'clothes', 'game_tools', 'other'];
    for (let type of lookTypes) {
      html.find(`.add-look-${type}`).click(ev => {
        ev.preventDefault();
        const arr = Array.from(this.item.system.look_suggestions?.[type] ?? []);
        arr.push({ label: '' });
        this.item.update({ [`system.look_suggestions.${type}`]: arr });
      });
      html.find(`.remove-look-${type}`).click(ev => {
        ev.preventDefault();
        const idx = Number(ev.currentTarget.dataset.index);
        let arr = Array.from(this.item.system.look_suggestions?.[type] ?? []);
        arr.splice(idx, 1);
        this.item.update({ [`system.look_suggestions.${type}`]: arr });
      });
    }
  }

  /**
   * Handles dropping an ability into a dropzone (initial/available).
   * Supports reordering and moving between lists.
   */
  async _onDropAbility(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.originalEvent.dataTransfer.getData('application/json'));
    } catch {
      // fallback for item drops (from compendium or sidebar)
      data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    }

    // Dragging between initial/available or reordering
    if (data.action === 'moveAbility') {
      const fromType = data.type;
      const fromIndex = data.index;
      const toType = $(event.currentTarget).data('type');

      if (!['initial', 'available'].includes(fromType) || !['initial', 'available'].includes(toType)) return;

      let fromArr = Array.from(this.item.system[`${fromType}_abilities`] ?? []);
      let toArr = Array.from(this.item.system[`${toType}_abilities`] ?? []);

      // Remove from source
      const [moved] = fromArr.splice(fromIndex, 1);

      // Insert at end of target
      toArr.push(moved);

      // Update both arrays
      await this.item.update({
        [`system.${fromType}_abilities`]: fromArr,
        [`system.${toType}_abilities`]: toArr,
      });
      return;
    }

    // Dropping an ability item from sidebar/compendium
    if (data.type === "Item" && data.uuid) {
      const item = await fromUuid(data.uuid);
      if (item && item.type === "ability") {
        const dropzoneType = $(event.currentTarget).data('type');
        let arr = Array.from(this.item.system[`${dropzoneType}_abilities`] ?? []);
        // Add by name if not already present
        if (!arr.includes(item.name)) {
          arr.push(item.name);
          await this.item.update({ [`system.${dropzoneType}_abilities`]: arr });
        }
      }
    }
  }

async _showAbilityPickerDialog(type) {
  // Gather all ability items from world and compendiums, grouped
  let worldAbilities = game.items?.filter(i => i.type === "ability") ?? [];
  let compendiumAbilities = {};

  // Collect abilities from each compendium
  for (let pack of game.packs.filter(p => p.documentName === "Item")) {
    const index = await pack.getIndex();
    const abilitiesInPack = [];
    for (let entry of index) {
      if (entry.type === "ability" && !worldAbilities.some(a => a.name === entry.name)) {
        abilitiesInPack.push({ name: entry.name, _id: entry._id, pack: pack.collection });
      }
    }
    if (abilitiesInPack.length) {
      compendiumAbilities[pack.metadata.label] = abilitiesInPack.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  // Sort world abilities
  worldAbilities = worldAbilities.sort((a, b) => a.name.localeCompare(b.name));

  const worldLabel = game.i18n.localize("PERFECT_DRAW.AbilityPicker.WorldAbilities");
  const compendiumLabel = game.i18n.localize("PERFECT_DRAW.AbilityPicker.CompendiumAbilities");
  const noWorldAbilities = game.i18n.localize("PERFECT_DRAW.AbilityPicker.NoWorldAbilities");
  const noCompendiumAbilities = game.i18n.localize("PERFECT_DRAW.AbilityPicker.NoCompendiumAbilities");

// Build dialog content
let content = `
  <div class="pd-manga-dialog">
    <input type="text" id="ability-search" placeholder="${game.i18n.localize("PERFECT_DRAW.AbilityPicker.Search")}" />
    <div style="max-height:250px;overflow-y:auto;margin-top:0.5em;">
      <div style="margin-bottom:0.5em;">
        <strong>${worldLabel}</strong>
        <ul id="ability-list-world">
          ${
            worldAbilities.length
              ? worldAbilities.map((a, i) => `<li data-type="world" data-index="${i}">${a.name}</li>`).join('')
              : `<li style="color:#888;cursor:default;">${noWorldAbilities}</li>`
          }
        </ul>
      </div>
      <div>
        <strong>${compendiumLabel}</strong>
        ${
          Object.keys(compendiumAbilities).length
            ? Object.entries(compendiumAbilities).map(([packLabel, abilities]) => `
                <div style="margin-bottom:0.3em;">
                  <span class="section-header">${packLabel}</span>
                  <ul class="ability-list-compendium" data-pack="${packLabel}">
                    ${
                      abilities.length
                        ? abilities.map((a, i) => `<li data-type="compendium" data-pack="${packLabel}" data-index="${i}">${a.name}</li>`).join('')
                        : `<li style="color:#888;cursor:default;">${noCompendiumAbilities}</li>`
                    }
                  </ul>
                </div>
              `).join('')
            : `<div style="color:#888;margin:0.5em 0 0.5em 0;">${noCompendiumAbilities}</div>`
        }
      </div>
    </div>
  </div>
`;

  let selectedAbility = null;

  new Dialog({
    title: game.i18n.localize("PERFECT_DRAW.PickAbility"),
    content,
    buttons: {
      ok: {
        label: game.i18n.localize("PERFECT_DRAW.Add"),
        callback: async (html) => {
          if (!selectedAbility) return;
          let arr = Array.from(this.item.system[`${type}_abilities`] ?? []);
          if (!arr.includes(selectedAbility.name)) {
            arr.push(selectedAbility.name);
            await this.item.update({ [`system.${type}_abilities`]: arr });
          }
        }
      },
      cancel: { label: game.i18n.localize("Cancel") }
    },
    render: html => {
      const $search = html.find('#ability-search');
      const $worldList = html.find('#ability-list-world');
      const $compLists = html.find('.ability-list-compendium');
      $search.on('input', function () {
        const val = $(this).val().toLowerCase();
        $worldList.children('li').each(function () {
          const $li = $(this);
          $li.toggle($li.text().toLowerCase().includes(val));
        });
        $compLists.each(function () {
          $(this).children('li').each(function () {
            const $li = $(this);
            $li.toggle($li.text().toLowerCase().includes(val));
          });
        });
      });
      // Click handlers for world abilities
      $worldList.on('click', 'li', function () {
        $worldList.children('li').css('background', '');
        $compLists.children('li').css('background', '');
        $(this).css('background', '#a0c4ff');
        const idx = Number($(this).data('index'));
        selectedAbility = worldAbilities[idx];
      });
      // Click handlers for compendium abilities
      $compLists.on('click', 'li', function () {
        $worldList.children('li').css('background', '');
        $compLists.children('li').css('background', '');
        $(this).css('background', '#a0c4ff');
        const packLabel = $(this).data('pack');
        const idx = Number($(this).data('index'));
        selectedAbility = compendiumAbilities[packLabel][idx];
      });
    },
    default: 'ok'
  }).render(true);
}
}