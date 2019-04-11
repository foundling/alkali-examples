const { 

  all,
  reactive,

  Element,
  Div,
  Input, 
  LI, 
  Button,
  UL, 

  Renderer, 
  Variable,
  VString,
  VArray,

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
const activeSelections = reactive([])
const searchFilter = new VString('')

/* default constructors */
const DefaultItem = LI.with('.btn.btn-sm')
const DefaultInput = Div.with('.search-input-container', [
  Input.with('.search-input', { placeholder: 'Reasons for Rejection'}),
  Button.with('.search-input-icon.fa.fa-search')
])

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
    console.log(this.items)

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
    const listItems = this.items.map((itemText, index) => new this.Item('.dre-dropdown-list-item', {
      textContent: itemText,
      id: `dre-dd-item-${index}`,
      classes: {
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

const items = reactive(['one','two','three'])
const reasonsRejected = reactive([])
const D = Dropdown.defineElement('dre-dropdown')
const MyListItem = LI.with('.rejection-reason', {
  onclick() {
    console.log('toggle rating!')
  }
})

const dd = new D({
  data: {
    items
  },
  ui: {
    Item: MyListItem
  }
})
document.body.appendChild(dd)


//document.body.appendChild(new alkali.Div(searchFilter))
//document.body.appendChild(new alkali.Div(activeSelections.to(JSON.stringify)))
///export default Dropdown.defineElement('dre-dropdown')
