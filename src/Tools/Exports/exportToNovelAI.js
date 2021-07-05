setup.exportToNovel = (town, npcs) => {
  const briefDescription = Story.get('BriefDescription').processText().trim()
  const $offshore = $('<div />')
  const doc3 = $offshore.wiki(briefDescription)
  const resultText = doc3.textContent || doc3.innerText || doc3.innerHTML
  alert(JSON.stringify(resultText))
  const novel = {
    scenarioVersion: 0,
    title: `The ${town.type} of ${town.name}`,
    /** Brief overview */
    description: `The ${town.type} of ${town.name} is a ${town.economicIdeology} ${town.politicalIdeology} ${town.politicalSource}. It has a population of ${town.population}, and its citizens live a ${town.wealth} life. The ${town.type} grew around ${lib.articles.output(town.origin)}, and is comprised ${lib.getPredominantRace(town.demographicPercentile).amountDescriptive}.`,
    /** The prompt part of it */
    prompt: `
    A population of ${town.population}, the denizens live ${lib.articles.output(lib.getTownWealth(town.roll.wealth))} existence. 
    ${town.economicIdeologyDescription(town)} ${town.politicalSourceDescription(town)}
    ${lib.getTownEconomics(town)} ${lib.getTownWelfare(town)}
    ${lib.getTownMilitary(town)} ${lib.getTownLaw(town)} ${lib.getTownArcana(town)}`,
    tags: [
      'fantasy',
      'dungeons and dragons',
      town.type,
      town.economicIdeology
    ],
    context: [
      {
        text: resultText,
        contextConfig: {
          prefix: '',
          suffix: '\n',
          tokenBudget: 2048,
          reservedTokens: 0,
          budgetPriority: 800,
          trimDirection: 'trimBottom',
          insertionType: 'token',
          insertionPosition: 0
        }
      },
      {
        text: `[This is a description of a fantasy ${town.type} for use in Dungeons and Dragons games.]`,
        contextConfig: {
          prefix: '',
          suffix: '\n',
          tokenBudget: 2048,
          reservedTokens: 2048,
          budgetPriority: -400,
          trimDirection: 'trimBottom',
          insertionType: 'newline',
          insertionPosition: -4
        }
      }
    ],
    placeholders: [
      {
        key: '$town.name',
        description: `the name of the ${town.type}`,
        defaultValue: town.name
      },
      {
        key: '$town.leaderType',
        description: 'the leadership type',
        defaultValue: town.leaderType
      },
      {
        key: '<<profile $town.guard>>',
        description: 'The name of the guards',
        defaultValue: lib.getPolice(town.factions).name
      },
      {
        key: '$town.leader.title',
        description: 'title of the leader',
        defaultValue: town.leader.title
      },
      {
        key: '<<profile $npcs[$town.leader.key]>>',
        description: 'name of the leader',
        defaultValue: npcs[town.leader.key].name
      }
    ],
    settings: {
      parameters: {
        temperature: 0.8,
        max_length: 40,
        min_length: 20,
        top_k: 50,
        top_p: 0.9,
        tail_free_sampling: 1,
        repetition_penalty: 2,
        repetition_penalty_range: 512,
        repetition_penalty_slope: 3.33,
        bad_words_ids: [

        ]
      },
      trimResponses: true,
      banBrackets: true
    },
    lorebook: {
      lorebookVersion: 1,
      entries: [
      ]
    },
    author: 'Eigengraus Generator'
  }
  const defaults = {
    text: '',
    displayName: '',
    keys: [
    ],
    contextConfig: {
      prefix: '',
      suffix: '\n',
      tokenBudget: 2048,
      reservedTokens: 0,
      budgetPriority: 400,
      trimDirection: 'trimBottom',
      insertionType: 'newline',
      insertionPosition: -1
    },
    lastUpdatedAt: 1624016826515,
    searchRange: 1000,
    enabled: true,
    forceActivation: false
  }
  const npcData = []
  const buildingData = []
  const factionData = []
  for (const temp in npcs) {
    const npc = npcs[temp]
    const npcLore = {
      ...defaults,
      text: `${npc.name} is ${lib.articles.output(npc.profession)}. ${npc.heshe.toUpperFirst()} is ${lib.articles.output(npc.descriptor)} who is ${npc.calmTrait} when calm, but gets ${npc.stressTrait} when stressed.`,
      displayName: npc.name,
      keys: [
        npc.name,
        npc.profession,
        npc.race
      ]
    }
    npcData.push(npcLore)
  }
  for (const temp in town.factions) {
    const faction = town.factions[temp]
    const factionLore = {
      ...defaults,
      text: faction.tippyDescription,
      displayName: faction.name,
      keys: [
        faction.name,
        faction.type,
        faction?.leader?.name || faction.wordNoun
      ]
    }
    factionData.push(factionLore)
  }
  for (const building of town.buildings) {
    const buildingLore = {
      ...defaults,
      text: building.tippyDescription || `${lib.articles.output(building.size || building.wealth || 'normal').toUpperFirst()} ${building.wordNoun} that's ${building.cleanliness}, and is known for ${building.notableFeature}.`,
      displayName: building.name,
      keys: [
        building.name,
        building.type,
        building.specialty || building.notableFeature || 'building'
      ]
    }
    buildingData.push(buildingLore)
  }
  novel.lorebook.entries.push(...npcData, ...buildingData, ...factionData)
  downloadObjectAsJson(novel, `The ${town.type} of ${town.name}`)
}

function downloadObjectAsJson (exportObj, exportName) {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportObj))}`
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', `${exportName}.scenario`)
  document.body.appendChild(downloadAnchorNode) // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
