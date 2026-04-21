import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Champion = {
  id: number
  name: string
  traits: string
  price: number | null
}

type Comp = {
  id: number
  title: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

type CompChampion = {
  id: number
  compId: number
  championId: number
  isMainCarry: boolean
  itemNotes: string | null
  champion: Champion
}

type CompDetail = {
  id: number
  title: string
  notes: string | null
  createdAt: string
  updatedAt: string
  champions: CompChampion[]
}

function getTraitCounts(compDetail: CompDetail | null) {
  if (!compDetail) return []

  const traitMap: Record<string, number> = {}

  for (const entry of compDetail.champions) {
    const traits = entry.champion.traits
      .split(',')
      .map((trait) => trait.trim())
      .filter(Boolean)

    for (const trait of traits) {
      traitMap[trait] = (traitMap[trait] || 0) + 1
    }
  }

  return Object.entries(traitMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

function getTraitList(traits: string) {
  return traits
    .split(',')
    .map((trait) => trait.trim())
    .filter(Boolean)
}
function groupChampionsByPrice(champions: Champion[]) {
  const groups: Record<number, Champion[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  }

  for (const champion of champions) {
    const price = champion.price
    if (price && groups[price]) {
      groups[price].push(champion)
    }
  }

  return groups
}

function App() {
  const [champions, setChampions] = useState<Champion[]>([])
  const [comps, setComps] = useState<Comp[]>([])
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null)
  const [selectedCompDetail, setSelectedCompDetail] = useState<CompDetail | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [addingChampionId, setAddingChampionId] = useState<number | null>(null)

  const fetchChampions = async () => {
    const response = await fetch('http://localhost:3000/champions')
    if (!response.ok) {
      throw new Error('failed to fetch champions')
    }
    return response.json()
  }

  const fetchComps = async () => {
    const response = await fetch('http://localhost:3000/comps')
    if (!response.ok) {
      throw new Error('failed to fetch comps')
    }
    return response.json()
  }

  const fetchCompDetail = async (compId: number) => {
    const response = await fetch(`http://localhost:3000/comps/${compId}`)
    if (!response.ok) {
      throw new Error('failed to fetch comp detail')
    }
    return response.json()
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [championsData, compsData] = await Promise.all([
        fetchChampions(),
        fetchComps(),
      ])

      setChampions(championsData)
      setComps(compsData)
    } catch (err) {
      console.error(err)
      setError('failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateComp = async (e: FormEvent) => {
    e.preventDefault()

    if (!newTitle.trim()) {
      alert('please enter a comp title')
      return
    }

    try {
      setCreating(true)

      const response = await fetch('http://localhost:3000/comps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          notes: newNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('failed to create comp')
      }

      const createdComp = await response.json()

      setNewTitle('')
      setNewNotes('')
      await loadData()
      await handleSelectComp(createdComp.id)
    } catch (err) {
      console.error(err)
      alert('failed to create comp')
    } finally {
      setCreating(false)
    }
  }

  const handleSelectComp = async (compId: number) => {
    try {
      setSelectedCompId(compId)
      const detail = await fetchCompDetail(compId)
      setSelectedCompDetail(detail)
    } catch (err) {
      console.error(err)
      alert('failed to load comp detail')
    }
  }

  const handleAddChampion = async (
    championId: number,
    isMainCarry: boolean,
    itemNotes: string
  ) => {
    if (!selectedCompId) return

    try {
      setAddingChampionId(championId)

      const response = await fetch(
        `http://localhost:3000/comps/${selectedCompId}/champions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            championId,
            isMainCarry,
            itemNotes,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'failed to add champion')
      }

      const updatedDetail = await fetchCompDetail(selectedCompId)
      setSelectedCompDetail(updatedDetail)
    } catch (err) {
      console.error(err)
      alert('failed to add champion, maybe this champion is already in the comp')
    } finally {
      setAddingChampionId(null)
    }
  }

  const handleRemoveChampion = async (entryId: number) => {
    if (!selectedCompId) return

    try {
      const response = await fetch(
        `http://localhost:3000/comps/${selectedCompId}/champions/${entryId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'failed to remove champion')
      }

      const updatedDetail = await fetchCompDetail(selectedCompId)
      setSelectedCompDetail(updatedDetail)
    } catch (err) {
      console.error(err)
      alert('failed to remove champion')
    }
  }

  const handleDeleteComp = async (compId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/comps/${compId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'failed to delete comp')
      }

      if (selectedCompId === compId) {
        setSelectedCompId(null)
        setSelectedCompDetail(null)
      }

      await loadData()
    } catch (err) {
      console.error(err)
      alert('failed to delete comp')
    }
  }

  const traitCounts = getTraitCounts(selectedCompDetail)
  const championsByPrice = groupChampionsByPrice(champions)

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="header-card">
          <div className="header-kicker">tft comp notebook</div>
          <h1 className="header-title">tft comp notes</h1>
          <p className="header-description">
            build comps, mark a main carry, save item notes, and track active traits.
          </p>
        </header>

        {loading && (
          <div className="card">
            <p>loading...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card error-card">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="content-grid">
              <div className="left-column">
                <section className="card">
                  <SectionTitle
                    title="create new comp"
                    subtitle="add a new comp shell before selecting units"
                  />

                  <form onSubmit={handleCreateComp} className="form-stack">
                    <label className="field">
                      <span className="field-label">comp title</span>
                      <input
                        className="input"
                        type="text"
                        placeholder="for example sniper frontline"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">notes</span>
                      <textarea
                        className="textarea"
                        placeholder="short notes about this comp"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        rows={4}
                      />
                    </label>

                    <button className="btn btn-primary" type="submit" disabled={creating}>
                      {creating ? 'creating...' : 'create comp'}
                    </button>
                  </form>
                </section>

                <section className="card">
                  <SectionTitle
                    title="saved comps"
                    subtitle={`${comps.length} comp${comps.length === 1 ? '' : 's'} saved`}
                  />

                  {comps.length === 0 ? (
                    <EmptyState text="no comps yet" />
                  ) : (
                    <div className="comp-list">
                      {comps.map((comp) => {
                        const isSelected = selectedCompId === comp.id

                        return (
                          <div
                            key={comp.id}
                            className={`comp-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectComp(comp.id)}
                          >
                            <div className="comp-card-head">
                              <div>
                                <div className="comp-card-title">{comp.title}</div>
                                <div className="comp-card-notes">{comp.notes || 'no notes'}</div>
                              </div>

                              {isSelected && <span className="badge-selected">selected</span>}
                            </div>

                            <div className="button-row">
                              <button
                                className="btn btn-secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectComp(comp.id)
                                }}
                              >
                                open comp
                              </button>

                              <button
                                className="btn btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteComp(comp.id)
                                }}
                              >
                                delete
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>

              <div className="right-column">
                <section className="card">
                  {!selectedCompDetail ? (
                    <div>
                      <SectionTitle
                        title="comp editor"
                        subtitle="choose a saved comp to start editing"
                      />
                      <EmptyState text="select a comp from the left panel" />
                    </div>
                  ) : (
                    <>
                      <div className="editor-header">
                        <div>
                          <div className="editor-kicker">now editing</div>
                          <h2 className="editor-title">{selectedCompDetail.title}</h2>
                          <p className="editor-notes">{selectedCompDetail.notes || 'no notes'}</p>
                        </div>

                        <div className="editor-stat">
                          <div className="mini-label">units</div>
                          <div className="mini-value">{selectedCompDetail.champions.length}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '22px' }}>
                        <SectionMiniTitle title="current traits" />
                        {traitCounts.length === 0 ? (
                          <EmptyState text="no traits yet" compact />
                        ) : (
                          <div className="traits-wrap">
                            {traitCounts.map((trait) => (
                              <div key={trait.name} className="trait-badge">
                                <span>{trait.name}</span>
                                <span className="trait-count">x {trait.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: '22px' }}>
                        <SectionMiniTitle title="champions in this comp" />
                        {selectedCompDetail.champions.length === 0 ? (
                          <EmptyState text="this comp has no champions yet" compact />
                        ) : (
                          <div className="unit-list">
                            {selectedCompDetail.champions.map((entry) => (
                              <div key={entry.id} className="unit-card">
                                <div className="unit-card-top">
                                  <div className="unit-main">
                                    <div className="unit-title-row">
                                      <div className="unit-name">{entry.champion.name}</div>

                                      <span className="price-pill">
                                        {entry.champion.price ?? '-'} cost
                                      </span>

                                      {entry.isMainCarry && (
                                        <span className="carry-badge">main carry</span>
                                      )}
                                    </div>

                                    <div className="small-traits">
                                      {getTraitList(entry.champion.traits).map((trait) => (
                                        <span key={trait} className="small-trait-pill">
                                          {trait}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="item-text">
                                      items: {entry.itemNotes || 'no items'}
                                    </div>
                                  </div>

                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveChampion(entry.id)}
                                  >
                                    remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      
                    </>
                  )}
                </section>
              </div>
            </div>

            <section className="card">
  <SectionTitle
    title="champion pool"
    subtitle="add champions to the selected comp by cost tier"
  />

  {!selectedCompDetail && (
    <div style={{ marginBottom: '16px' }}>
      <EmptyState text="select a comp first to add champions from the pool" compact />
    </div>
  )}

  {[1, 2, 3, 4, 5].map((cost) => (
    <div key={cost} style={{ marginBottom: '24px' }}>
      <h3 className="section-mini-title">{cost}-cost</h3>

      {championsByPrice[cost].length === 0 ? (
        <EmptyState text={`no ${cost}-cost champions yet`} compact />
      ) : (
        <div className="pool-grid">
          {championsByPrice[cost].map((champion) => {
            const alreadyAdded =
              selectedCompDetail?.champions.some(
                (entry) => entry.championId === champion.id
              ) ?? false

            return (
              <ChampionAddCard
                key={champion.id}
                champion={champion}
                alreadyAdded={alreadyAdded}
                loading={addingChampionId === champion.id}
                onAdd={handleAddChampion}
                disabled={!selectedCompDetail}
              />
            )
          })}
        </div>
      )}
    </div>
  ))}
</section>
          </>
        )}
      </div>
    </div>
  )
}

type ChampionAddCardProps = {
  champion: Champion
  alreadyAdded: boolean
  loading: boolean
  disabled?: boolean
  onAdd: (championId: number, isMainCarry: boolean, itemNotes: string) => void
}

function ChampionAddCard({
  champion,
  alreadyAdded,
  loading,
  disabled = false,
  onAdd,
}: ChampionAddCardProps) {
  const [isMainCarry, setIsMainCarry] = useState(false)
  const [itemNotes, setItemNotes] = useState('')

  return (
    <div className={`add-card ${alreadyAdded ? 'added' : ''}`}>
      <div className="add-card-top">
        <div>
          <div className="unit-title-row">
            <div className="unit-name">{champion.name}</div>
            <span className="price-pill">{champion.price ?? '-'} cost</span>
          </div>
  
          <div className="small-traits">
            {getTraitList(champion.traits).map((trait) => (
              <span key={trait} className="small-trait-pill">
                {trait}
              </span>
            ))}
          </div>
        </div>
  
        {alreadyAdded && <span className="badge-selected">already added</span>}
      </div>
  
      {!alreadyAdded && (
        <>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isMainCarry}
              onChange={(e) => setIsMainCarry(e.target.checked)}
              disabled={disabled}
            />
            set as main carry
          </label>
  
          <div className="add-actions">
            <input
              className="input add-input"
              type="text"
              placeholder="items"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              disabled={disabled}
            />
  
            <button
              className="btn btn-primary"
              onClick={() => onAdd(champion.id, isMainCarry, itemNotes)}
              disabled={loading || disabled}
            >
              {disabled ? 'select comp first' : loading ? 'adding...' : 'add to comp'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  )
}

function SectionMiniTitle({ title }: { title: string }) {
  return <h3 className="section-mini-title">{title}</h3>
}

function EmptyState({
  text,
  compact = false,
}: {
  text: string
  compact?: boolean
}) {
  return <div className={`empty-state ${compact ? 'compact' : ''}`}>{text}</div>
}

export default App