const { 

  all,
  reactive,

  Element,
  Div,
  Input, 
  LI, 
  Button,
  UL, 
  Span,

  Renderer, 
  Variable,
  VString,
  VArray,

} = alkali

/*
 * value: 
 * events
 *
 *  maxSelections: Number,
 *  items: [],
 *  searchInputConstructor,
 *  listItemConstructor,
 *
 */

/* selection and filter data */

class Dropdown extends Element.with({ 

  children: [ 
    Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-list-container')
      ]
    })
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

  created({ items, hidden, ItemConstructor, InputConstructor }) {

    /* ensure data is reactive */
    this.items = items instanceof Variable ? items : reactive(items || [])

    /* state */
    this.hidden = hidden || false
    this.searchFilter = new VString('')
    this.activeSelections = reactive([])

    /* pick constructors */
    this.Item = (ItemConstructor || LI).with('.dre-dd-list-item', {
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      }
    })
    this.Input = (InputConstructor || Div).with('.dre-dd-search-input', {
      children: [
        Input.with('.dre-dd-search-input'),
        Span.with('.fa.fa-caret-down.dre-dd-search-input-icon')
      ]
    })

  }
  attached() {

    const [dropdownContainer] = [...this.children]
    const [searchContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.listContainer = listContainer

    this.searchContainer.append(new this.Input({
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      }  
    }))
    this.listContainer.append(
      new UL('.dre-dd-list', [
        this.items.map((itemText, index) => new this.Item('.dre-dd-list-item', {
          textContent: itemText,
          id: `dre-dd-item-${index}`,
          classes: {
            hidden: this.searchFilter.to(searchFilter => {
              if (searchFilter.length == 0)
                return false
              return !Boolean(itemText.match(searchFilter))
            }),
            selected: this.activeSelections.to(selections => selections[index])
          }
        }))

      ])
    )

    this.listContainer.addEventListener('click', this.onSelect.bind(this))
    
  }
  onSelect({ target }) {

    let [ul] = [...this.listContainer.children]
    let listItems = [...ul.children]
    let index = listItems.indexOf(target)

    if (index < 0) 
      return

    this.activeSelections.set(index, this.activeSelections.get(index) == null ? true : null )

  }

  toggle() {
  }

  show() {
  }

  hide() {
  }

}
//export default Dropdown.defineElement('dre-dd')

const items = reactive(['one','two','three'])
const reasonsRejected = reactive([])
const D = Dropdown.defineElement('dre-dd')


const dd = new D({
  items,
  hidden: false,
  //Item: MyListItem
})
document.body.appendChild(dd)

//document.body.appendChild(new alkali.Div(searchFilter))
//document.body.appendChild(new alkali.Div(activeSelections.to(JSON.stringify)))
