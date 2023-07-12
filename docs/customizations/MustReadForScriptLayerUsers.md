# Must Read

If you are using Customer Service Omnichannel out-of-box chat offering (in the form of a script), please note that there are certain differences between the sample code shown in this dev guide and the implementation you'll need to do on your html page.

Here is the [official doc](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop-live-chat-widget) on the out-of-box script offering.

## 1. Use `data-customization-callback` to pass in customizations

The sample code used in this dev guide are regarding to the React package users. For script users, please refer to [this](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop-live-chat-widget) and pass the customization object through the callback data tag.

For example, the below javascript-level sample code will be translated into the html-level code like this:

```js
liveChatWidgetProps = {
    ...liveChatWidgetProps,
    chatButtonProps: {
        controlProps: {
            hideChatTextContainer: true
        },
        styleProps: {
            generalStyleProps: {
                width: "60px",
                height: "60px"
            }
        }
    }
};
```

to 

```html
...
<script>
    function lcw() {
        return {
            chatButtonProps: {
                controlProps: {
                    hideChatTextContainer: true
                },
                styleProps: {
                    generalStyleProps: {
                        width: "60px",
                        height: "60px"
                    }
                }
            }
        }
    }
</script>
<script v2 data-customization-callback="lcw"
    ...
</script>
...
```
And the result will be the same after rendering.

## 2. Script offering only accepts static customization items

"Static" here means the customization callback object can only have primitive values like strings and numbers. There's currently no way of passing functions and custom React components through the script offering.

For example, on your html page, this will work correctly:

```html
...
<script>
    function lcw() {
        return {
            headerProps: {
                controlProps: {
                    headerTitleProps: {
                        text: "Contoso Coffee"
                    }
                }
            }
        }
    }
</script>
<script v2 data-customization-callback="lcw"
    ...
</script>
...
```

But this will not work:

```html
...
<script>
    function lcw() {
        return {
            headerProps: {
                controlProps: {
                    rightGroup: {
                        children: [
                            <button>Custom Button</button>
                        ]
                    }
                }
            }
        }
    }
</script>
<script v2 data-customization-callback="lcw"
    ...
</script>
...
```

If you'd like to add custom components or have functional changes, please use the React package in this repo.
