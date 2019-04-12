const hideMe = reactive(false)
const block = new Button('.dd-button', { 
  onclick() {
    hideMe.put(!hideMe.valueOf())
  },
  textContent: 'dropdown', 
  style: {
    fontSize: '40px',
      padding: '50px',
      border: '1px solid black',
      marginLeft: '300px',
  }
})
const items = reactive(['one','two','three'])
const reasonsRejected = reactive([])
const D = Dropdown.defineElement('dre-dd')

document.body.appendChild(block)


const dd = new D('#demo', {
  classes: {
    hidden: hideMe,
  }
}, {
  parent: document.querySelector('.dd-button'),
  corner: 'bottomleft',
  items: data,
  //Item: MyListItem
})

document.body.appendChild(dd)

document.body.appendChild(
  new Div({
      style: { 
        'margin-top': '200px',
      }
    }, [ 
      new Span('SEARCH STRING: '), 
      new Span(dd.searchFilter) 
    ]
  )
)

document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ 
    new Span('SELECTIONS: '), 
    //new Span(filteredSelections.to(x => x.join(' | ')))
  ])
)
document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ new Span('SELECTION DATA: '), 
       new Span(dd.selectedByIndex.to(obj => Object.keys(obj).map(k => obj[k]).join(' | '))) ]
  )
)
