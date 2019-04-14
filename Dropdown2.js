const { 

  all,
  not,
  reactive,

  Button,
  Div,
  Element,
  I,
  Input, 
  LI, 
  Span,
  UL, 

  Renderer, 
  Variable,
  VString,
  VArray,

} = alkali

class Dropdown extends Element { 

  created(props) { 

    const {

      items, 
      values = [], 
      parent = null, 
      open = true, 
      closeOnClick = true,
      corner = 'topright', 
      placeholder = '',
      maxSelections = null,
      ItemConstructor,
      InputConstructor 

    } = this.props = props


    /* ensure data is reactive */
    props.items = items instanceof Variable ? items : reactive(items || [])

    /* ensure data is reactive and initialized */
    // join w/ selected values somehow.  Just call initializeSelected
    props.values = values instanceof Variable ? values : reactive(values || [])
    props.maxSelections = maxSelections || props.items.get('length') 

    // work out what happens when you reach max. 
    // proposal: 
    // if it's one, just change the selection.
    // if multiple, change last selection to this one.

    /* state */
    props.open = reactive(open)
    props.placeholder = reactive(placeholder)
    props.parent = parent
    props.corner = corner // verify type algebraically
    props.selectedByIndex = reactive(this.initializeSelected(props.values.valueOf(), props.items.valueOf())) // map from index to value
    props.selectedValues = props.selectedByIndex.to(obj => { // array of just values
      return Object.keys(obj).reduce((arr, key) => {
        return obj[key] ? arr.concat(obj[key]) : arr
      }, [])
    })
    props.searchFilter = new VString('')
    props.hasMatches = all(props.searchFilter, props.items).to(([searchFilter, items]) => {
      if (searchFilter.length === 0) 
        return true 
      return items.filter(item => item.toLowerCase().includes(searchFilter.toLowerCase())).length > 0
    })

    /* pick constructors */
    // API: custom constructors must have at least the default children
    props.Item = ItemConstructor || Button.with('.dre-dd-list-item')
    props.Input = (InputConstructor || Div.with('.dre-dd-search-input', {
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      },
      children: [
        Input.with('.dre-dd-search-input-el', {
          placeholder: props.placeholder
        }),
        Span.with('.fa.fa-search.dre-dd-search-input-icon')
      ]
    }))

  }
  ready(props) {

    /* SELECTION LIST */
    const selectedList = props.items.to(items => items.map((item, index) => {
      return new Button('.dre-dd-list-item.selected', {
        id: `dre-dd-selected-item-${index}`,
        classes: {
          selected: props.selectedByIndex.to(selectedMap => {
            return Boolean(selectedMap[index])
          })
        }
      }, [
        Span(item),
        I('.fa.fa-remove.remove-item')
      ])
    }))
    const unselectedList = props.items.to(items => {
      return items.length <= 0 ? [ new Button('.dre-dd-no-results') ] : items.map((itemText, index) => new props.Item({
        id: `dre-dd-unselected-item-${index}`,
        classes: {
          filtered: this.searchFilter.to(searchFilter => {
            if (searchFilter.length == 0)
              return false
            return !Boolean(itemText.toLowerCase().includes(searchFilter.toLowerCase()))
          }),
          selected: props.selectedByIndex.to(selections => selections[index])
        },
      }, [ Span(itemText) ]))
    })

    this.append(new (Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-selected-container', selectedList),
        Div.with('.dre-dd-list-container'),
        Div.with('.dre-dd-list-item.no-matches-found', {
          classes: {
            hidden: this.props.hasMatches
          }
        }, [
          Span('No Results Found!')
        ]),
      ]
    })))

    const [dropdownContainer] = [...this.children]
    const [searchContainer, selectionsContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.selectionsContainer = selectionsContainer 
    this.listContainer = listContainer
    this.searchInput = new props.Input({
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      }  
    })

    this.searchContainer.append(this.searchInput)

    /* UNSELECTED LIST ITEMS */
    this.listContainer.append(...unselectedList)

    this.listContainer.addEventListener('click', this.select.bind(this))
    this.selectionsContainer.addEventListener('click', this.remove.bind(this))

    if (props.parent)
      this.position(props.parent)

    this.handleOutsideClicks = (e) => {
      const target = e.target
      const dropdown = this
      const isOutsideClick = !dropdown.contains(target)
    }
    parent.addEventListener('click', this.handleOutsideClicks)

  }
  detached() {
    parent.removeEventListener('click', this.handleOutsideClicks)
  }
  initializeSelected(values, list) {
    const memo = {}
    for (let [i,v] of list.entries()) {
      if (values.includes(v))
        memo[i] = v
    }
    return memo
  }
  select({ target }) {

    const props = this.props
    const listItems = [...this.listContainer.children]
    const targetIndex = listItems.indexOf(target)
    const parentIndex = listItems.indexOf(target.parentNode)
    const index = [targetIndex, parentIndex].filter(i => i >= 0)[0]

    if (index == null)
      return

    const currentValue = props.selectedByIndex.get(index)
    if (currentValue == null) {
      props.selectedByIndex.set(index, props.items.get(index))
    }
    else
      props.selectedByIndex.undefine(index)

  }
  remove({ target }) {

    const props = this.props
    const listItems = [...this.selectionsContainer.children]
    if (!target.classList.contains('remove-item'))
      return
    const parentIndex = listItems.indexOf(target.parentNode)

    const currentValue = props.selectedByIndex.get(parentIndex)
    props.selectedByIndex.undefine(parentIndex)

  }

  position(node, options = { corner: this.props.corner }) {

    const mountPoint = node.getBoundingClientRect()
    const me = this.getBoundingClientRect()

    switch (options.corner) {

      case 'bottomleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'bottomright':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
      
      case 'topleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'topright':
        this.style.top = `${mountPoint.top}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
    }

  }
  isChildOf(nodeA, nodeB) {
    return nodeB.contains(nodeA)
  }
  attached() {
  }

  toggle() {
  }

  show() {
  }

  hide() {
  }

}
