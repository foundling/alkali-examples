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
 *  maxSelections
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
   *
   *  data, ui elements, events
   *  data: items, value
   *  ui: input elements 
   *  events: 
   *  dre-dd-selected: {},
   *  dre-dd-removed
   *
   *  positioning
   *
   */ 

  created({ parent, items, hidden, ItemConstructor, InputConstructor }) {

    /* ensure data is reactive */
    // do i allow a single item? Array.isArray
    this.items = items instanceof Variable ? items : reactive(items || [])

    /* state */
    this.parent = parent
    this.hidden = hidden || false
    this.searchFilter = new VString('')
    // think there, if new items are added, the active selection reprocesses array
    // array of booleans, indices are list items
    this.selectedByIndex = items.to(items => reactive(items.map(_ => false)) )

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

    const parent = this.parent
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

    // clean this up
    this.listContainer.append(
      new UL('.dre-dd-list', [
        this.items.map((itemText, index) => new this.Item('.dre-dd-list-item', {
          textContent: itemText,
          id: `dre-dd-item-${index}`,
          classes: {
            hidden: this.searchFilter.to(searchFilter => {
              if (searchFilter.length == 0)
                return false
              return !Boolean(itemText.toLowerCase().includes(searchFilter))
            }),
            selected: this.selectedByIndex.to(selections => selections[index])
          }
        }))

      ])
    )

    this.listContainer.addEventListener('click', this.onSelect.bind(this))
    this.position(this.parent)
  }
  onSelect({ target }) {

    let [ul] = [...this.listContainer.children]
    let listItems = [...ul.children]
    let index = listItems.indexOf(target)

    if (index < 0) 
      return

    this.selectedByIndex.set(index, !this.selectedByIndex.get(index))

  }

  position(node=this.parentNode, options = { corner: 'bottomleft' }) {
    // return early if there is no parent, to handle case of 'just a dropdown'

    const rect = node.getBoundingClientRect()
    const me = this.getBoundingClientRect()

    switch (options.corner) {

      case 'bottomleft':
        this.style.left = `${rect.left}px` 
        this.style.top = `${rect.bottom}px`
        return
      
      case 'bottomright':
        this.style.left = `${rect.right - this.offsetWidth}px` 
        this.style.top = `${rect.bottom}px`
        return
      
      case 'topleft':
        this.style.left = `${rect.left}px` 
        this.style.top = `${rect.top}px`
        return
      
      case 'topright':
        this.style.left = `${rect.right - this.offsetWidth}px` 
        this.style.top = `${rect.top}px`
        return
    }

  }

  toggle() {
  }

  show() {
  }

  hide() {
  }

}

const block = new Button('.dd-button', { 
  textContent: 'dropdown', 
  style: {
    fontSize: '40px',
      padding: '50px',
      border: '1px solid black',
      bottom: '0px',
      left: '0px',
  }
})
const items = reactive(['one','two','three'])
const reasonsRejected = reactive([])
const D = Dropdown.defineElement('dre-dd')

document.body.appendChild(block)


const dd = new D({
  parent: document.querySelector('.dd-button'),
  items,
  hidden: false,
  //Item: MyListItem
})

document.body.appendChild(dd)

document.body.appendChild(
  new Div({
    style: { 
      'margin-top': '200px',
    }
  }, [ new Span('SEARCH STRING: '), 
       new Span(dd.searchFilter) ]
  )
)
const filteredSelections = all(dd.selectedByIndex, dd.items)
                            .to(([xs, items]) => 
                              xs
                                .map((x,i) => x ? i : null)
                                .filter(i => i != null) 
                                .map(selectedIndex => items[selectedIndex])
                            )

document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ 
    new Span('SELECTIONS: '), 
    new Span(filteredSelections)
  ])
)
document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ new Span('SELECTION DATA: '), 
       new Span(dd.selectedByIndex.to(x => x.join(' | '))) ]
  )
)
