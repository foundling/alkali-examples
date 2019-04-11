const { 

  all,
  reactive,

  Element,
  Div,
  Input, 
  LI, 
  Span,
  UL, 

  Renderer, 
  Variable,
  VString,

} = alkali

/*
 * items[]: list of items to render
 * value: 
 * events
 *
 * data: 
 * ui: Element for list item
 */

/* selection and filter data */
const activeSelections = reactive({})
const activeSelectionsKeys = activeSelections.to(Object.keys)
const searchFilter = new VString('')

/* default constructors */
const DefaultItem = LI.with('.btn.btn-sm')
const DefaultInput = Div.with('.dre-dropdown-search-input-container', [
  Input.with('.dre-dropdown-search-input'),
  Span.with('.dre-dropdown-search-input-icon')
])

const FilteredSelection = () => {
}

class Dropdown extends Element.with({ 

  children: [ 
    UL.with('.dre-dropdown-list') 
  ] 

}) {

  /*
   * API:
   * data, ui elements, events
   * data: items, value
   * ui: input elements 
   * events: 
   *  dre-dd-selected: {},
   *  dre-dd-removed
   */ 

  created({ data = {}, ui = {} } = {}) {

    const { items, value } = data
    const { Item, Input } = ui

    /* ensure types are alkali */ 
    this.items = items instanceof Variable ? items : reactive(items || [])

    /* pick constructors */
    this.Item = Item || DefaultItem
    this.Input = Input || DefaultInput

  }
  attached() {

    this.inputContainer = new this.Input({
      onkeyup(e) {
        searchFilter.put(e.target.value)
      }
    })

    this.ul = this.children[0]
    const listItems = this.items.map((itemText, index) => new this.Item({
      textContent: itemText,
      id: `dre-dd-item-${index}`,
      classes: {
        'top-result': index === 0,
        hidden: searchFilter.to(searchFilter => {
          if (searchFilter.length == 0)
            return false
          return !Boolean(itemText.match(searchFilter))
        }),
        selected: activeSelections.to(selections => selections[index])
      }
    }))

    this.prepend(this.inputContainer)
    this.ul.append(...listItems)
    this.ul.addEventListener('click', this.onSelect.bind(this))
    
  }
  onSelect({ target }) {

    let children = [...this.ul.children]
    let index = children.indexOf(target)

    if (index < 0) 
      return

    activeSelections.set(index, activeSelections.get(index) == null ? true : null )

  }

}

const D = Dropdown.defineElement('dre-dropdown')
document.body.appendChild(new D({
  data: {
    items: ['one','two','three'] 
  }
}))
document.body.appendChild(new alkali.Div(searchFilter))
document.body.appendChild(new alkali.Div(activeSelections.to(JSON.stringify)))
///export default Dropdown.defineElement('dre-dropdown')
