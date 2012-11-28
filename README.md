### What is it?

Inline option selection for HTML Text Inputs, auto-complete after a token.

![](http://upload.mural.ly/santiagomontero/1354142421637.blob)

### Usage

``` javascript
  var values = [{val: 'foo', meta: 'extended foo'}]; // meta is extended search field
  $('textarea').sew({values: values}); // pass in the values
```

### Customization

- Elements classes are: `-sew-list-container, -sew-list, -sew-list-item, -sew-list-item, -sew-list-item.selected´
- You can customize the token (default is the @) by passing the `{token: ':'}`
- You can customize how elements are created by passing an `elementFactory`
  
``` javascript
  /**
  * @param {jQuery} element the target element (LI)
  * @param {*} e object containing the val and meta properties (from the input list)
  */
  function elementFactory(element, e) {
    // append whatever you want to the target element
    element.append({anyJQueryObject});
  }
```

### Meta
Originally written by @leChanteaux (santiago at mural.ly) - maintained by Mural.ly Dev Team (dev at mural.ly)