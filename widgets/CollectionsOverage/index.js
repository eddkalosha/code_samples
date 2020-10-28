BPSystem.initialize();

const ProgressBarCustom = props => {
    const { color1, color2 } = props;
    const value = props.value || 0;
    const ROUND_DECIMALS = 2;
    const isNumber =  value => typeof value === 'number' && isFinite(value);
    let [progress1,progress2] = [Math.abs(value),100 - Math.abs(value)];

    progress1 = isNumber(progress1) ? Number.parseFloat(progress1).toFixed(ROUND_DECIMALS) : 0;
    progress2 = isNumber(progress2) ? Number.parseFloat(progress2).toFixed(ROUND_DECIMALS) : 0;

    return(
        <React.Fragment>
            <div className="progress">
                <div className="progress-bar" role="progressbar"  style={{width:`${progress1}%`,backgroundColor:color1}}/>
                <div className="progress-bar progress-bar-warning" role="progressbar" style={{width:`${progress2}%`,backgroundColor:color2}}/>
            </div>
            <div
                style={{
                    fontSize: '13px',
                    color: '#999',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <div>Completed: <b>{`${progress1}%`}</b></div>
                <div><b>{`${progress2}%`}</b> Pending</div>
            </div>
         </React.Fragment>
    )
};

const DataWrapper = ({ render }) => {
    const defaultState = {
        all_actions: 0,
        due_date: "",
        scheduled_actions: 0,
        times_in_collection: 0,
        total_balance:0,
        unalloc_payment:0
    };
    const [data, setData] = React.useState(defaultState);
    const formatter = new BPUI.Tools.CurrencyFormatter({currencySign:"$"});

    React.useEffect(() => {
        formatter
            .loadUserConfig()
            .then(fetchAccount)
            .then(dataset => setData({
                ...dataset,
                total_balance: formatter.format(dataset.total_balance),
                unalloc_payment: formatter.format(dataset.unalloc_payment)
            }))
    }, []);

    return(
        <React.Fragment>
             {render(data)}
        </React.Fragment>
    )
};

function renderOverageTiles(data) {
    const icons = {
        gear:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkFBNzZFRDdBQUEwOTExRTdCNDA0Qzk2RUQ2OEMyNENGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkFBNzZFRDdCQUEwOTExRTdCNDA0Qzk2RUQ2OEMyNENGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QUE3NkVENzhBQTA5MTFFN0I0MDRDOTZFRDY4QzI0Q0YiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QUE3NkVENzlBQTA5MTFFN0I0MDRDOTZFRDY4QzI0Q0YiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz72KQe6AAABqElEQVR42rxWi22DMBA1KAO4G7gbeARGYIOyQTMCG3QE2gkYgWxAOgHZADYgdvscXa5nbJQqJz0Jx/je+T6PlOu6qmegVHmmHWaHlWBSOyyXyDpcHAoCT24eIbKI3qOBwzcQUTuT/Ra3HLH+ayyX1mF26BwqPHvrsUffrR0G7I/Y7/CseY04USAJa3/AJAptmeNAlmyGL/K8CClTQgoXsv4W08eYG9xKR6I3SKnZ2J/xzmbqNHLOHfmDE5yEugxC3SzeUzEiDWcdCs9JvB1ZQC2IeVAT9iqJaEYBOyHKiZFQtJHAevi73a74YfudgUIotMFsvCQUo4js3/ymlMGgq2K2/JcE+dauotO+LUFaIrrgmoNDzYhODseIsw+HT/ZbAz/zXTbYDLRoW0mWWjJfBgWXZi40j86ZIysMYr/eWyeQBH1UqYFtY6KYCQ2iOkUk3WYvGulWpSCQ76yrbKIzaVdqnD+nRFUThTgisgmohMiD/s1Yj7nfI0pGnUtSMxBpqong6pxmiKFiH7PQndlNc8hUkBPyv2588DbtsOMf06t6wEr1JLsKMACWibbRQUEf6gAAAABJRU5ErkJggg==`,
        check:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI5MjVCRDk3ODYwNTExRUFCMDRFOUIxODMyRjEyOUQxIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI5MjVCRDk4ODYwNTExRUFCMDRFOUIxODMyRjEyOUQxIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjkyNUJEOTU4NjA1MTFFQUIwNEU5QjE4MzJGMTI5RDEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjkyNUJEOTY4NjA1MTFFQUIwNEU5QjE4MzJGMTI5RDEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz791aPUAAABP0lEQVR42mL8//8/Az0AEwOdAN0sYqGx+RxAvI7WFrEC8SIgtgbiYAZQYqAR7vkPARHgBEcjS4qhlqTDxGhhSTzUkhYgZqKVRV5QS+aiy1HTEgMg/g7Em4GYi1YWKQLxEyA+DsQC2NQwUqEIEgfibUAsBMRWQPwcqyoKfcIBxNuA+BsQ6+BTS6lFK6Dx4kpILYgoA2ITMizpgKawaGLUg4iDQPwciPVIsCQPakkWsXpAhDDUsrdAbEmEpkQg/gvE7aSEAIwhAsRHgfg3EPvj0eACxD+AeBGpQY3MEQLi7UD8E4gDsCjWhkb8GiDmpMQiEGaBuvY/mmUyQHwfiM8DsSQ5KRSbIBvUMlAQeQMxHxCfAuKnQCxNblbAJcEEtewrEF8C4jfQsoyB2hbBfLYYiD8DsTOl5SHjaHOLXAAQYADc2mQgEdd5HQAAAABJRU5ErkJggg==`,
        cashflow:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFFN0Q5Qjc5ODYwNjExRUE5NUY4QTA3NEQ5QkMwQkVGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFFN0Q5QjdBODYwNjExRUE5NUY4QTA3NEQ5QkMwQkVGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUU3RDlCNzc4NjA2MTFFQTk1RjhBMDc0RDlCQzBCRUYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUU3RDlCNzg4NjA2MTFFQTk1RjhBMDc0RDlCQzBCRUYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4rKYWjAAABvUlEQVR42rxW0VHDMAx1c/zjbpANGiYgI4QN2gkIExAmKEyQMkHKBAkTpJ2AbNBsEGx45lRVjpujV929axrLfpLsp3g2DIO6ht1M8I0Bas25k2cTMvI5bg0+DDZjk6MJGd3ZwAjmBg8YKw1agySUUWWg2dh7KEpiCchsaZ+keW6P9uTdIyE9l2iHjEugO9k/mxFBPvxaa1CzMYcYUB6UBgcDTd/zBaxDYZCBUFqoAHxEluALhCLRGg7WMRWIMow7q3jUBEv4/GVOT90SB6BHjTumoRJ7YWv/gvepZ882WCfje5QggsQTYUoirPFfBVABRxlpcnok6/G7FmTgsz31jUgJdoHju4Kf00wxpdc5ok7oY1Ld56THPU8ho0R6QoArZHk/4nMrEbmyZZ5JKU6lInuqWbl5d7drfUqdoeUiYyIdiI4OQMx8anZKE0mwJyITWk8JslwQa4FgFQhrX2dQgR7nIq08Y65t5ZImuXOCkpRnCNIn6kHqhWN9aqyX+Uor2Q+p71NuRVnj+c3glXSH0AdQC2Lvx+4MdkJOPoTN0XFVaoEmvL3U5URDEwt2J+hA1Fz6FvQvi9SV7FuAAQCPFz8pKvM0dAAAAABJRU5ErkJggg==`,
        cash:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkY1NEJGNUNGODYwNTExRUE4RjE5ODNBOTJDOEFBOTVFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkY1NEJGNUQwODYwNTExRUE4RjE5ODNBOTJDOEFBOTVFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RjU0QkY1Q0Q4NjA1MTFFQThGMTk4M0E5MkM4QUE5NUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RjU0QkY1Q0U4NjA1MTFFQThGMTk4M0E5MkM4QUE5NUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7MaKbEAAABL0lEQVR42txW0RGCMAylnAMwgm6AE4gTiBvoBjIBbsAI6gSeEwATWCZQJ9ANaqpBcxWweIQP392jcKQNyXsFhFLK6QOu0xMGOK6AHmOetcDW6cMWeGFIEgOFoxOpJwI8/0YfGFrGlmu/WldiCDzVPNkS78+wzRPgDnisiZ8CM1OjEudHmdXwgRsyWetaNMRXmsEGpVluwByryaxnt9QoVW/sgZ6tRm7Lig6olQSG6KjON+wCmGDCDPX0OFqn23Qkrbui1X9qnbbvFTewyQA4Bka4uUc4py7eb3Kdbse8pniJY0bcJxviz/SCvoIisliXSHUemkjiU3aNwEw0bbUB7aHXFlSjhKmiDzNIps9EYCYqmMwQm67jhHCN74dg4IdGvZghYvw5yalG//NfdxdgAHkIR/Ew8aDjAAAAAElFTkSuQmCC`,
        calendar:`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZGMUYwQTdCNjM3RTExRUFCQTM1QTMyNjJGMDkwMEVFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZGMUYwQTdDNjM3RTExRUFCQTM1QTMyNjJGMDkwMEVFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkYxRjBBNzk2MzdFMTFFQUJBMzVBMzI2MkYwOTAwRUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkYxRjBBN0E2MzdFMTFFQUJBMzVBMzI2MkYwOTAwRUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4IEI17AAABQUlEQVR42ryWDRGCQBCFPRNcA4lAA4lABCJgAmlABGyAJkASYANtgA1wVx8zOyBwwB07s4PAzX23P75FNU2z28QYZAKjNRF5unj/GaCw+VnmFCSimgUzBtE7TR6T5+QFeQ1YPAe0nwDwyWvyMx6XYslrdTPQfYCT10iXxvMM0USrUyfqkLeATjNEq5uBrj6iyAa6LrbS3ih2JSOx9j9tf6AubIETQRAgrknlSnlke3MkN1dSJ0Fcl/sWINsp+6qJcxDZAVn6C/ItgnwpUxJ0JT9aSptGc5W99hPS41kAJdhLDynDk9VhJcSDjKVjEhTOmTUDo6XCgfWUerdhJwshHI1vNGEFrDCpGepbdyESpFqIUqo3/OjC48KDYrA8PTpKwl0aYs2F/ET7vLsgo88t1C0T3wrSOFXpWNS9iFzbR4ABANocIPToyZ53AAAAAElFTkSuQmCC`
    };
    const ICON_SIZE = 35;
    const isProcessed = getProcessedStatus();

    return (
        <React.Fragment>
            <BPUI.TiledHeader>
                <BPUI.TiledHeaderItem 
                    col={33}  
                    positions={{ alignY: 'center', primary: 'flex-start', secondary: 'flex-start', iconX: 'left',  iconY: 'center' }} 
                    colors={{ primary:'gray',secondary:'#000'}} 
                    primary={'Date Strategy was applied'}
                    secondary={`${data.due_date}`}  
                    icon={<img src={icons.check} width={ICON_SIZE} height={ICON_SIZE} style={{background:'#fcb700', padding:'3px'}} />} 
                />
                <BPUI.TiledHeaderItem 
                    col={33}  
                    positions={ { alignY: 'center', primary: 'flex-start', secondary: 'left', iconX: 'left',  iconY: 'center' }} 
                    colors={{ primary:'gray',secondary:'#000'}} 
                    primary={'Actions scheduled'}
                    secondary={`${data.scheduled_actions}`}
                    icon={<img src={icons.calendar} width={ICON_SIZE} height={ICON_SIZE} style={{background:'#9acd32',padding:'3px'}} />}
                />
                <BPUI.TiledHeaderItem 
                    col={33}  
                    positions={ { alignY: 'center', primary: 'flex-start', secondary: 'left', iconX: 'left',  iconY: 'center' }} 
                    colors={{ primary:'gray',secondary:'#000'}} 
                    primary={'Times in Collections'}
                    secondary={`${data.times_in_collection}`} 
                    icon={<img src={icons.gear} width={ICON_SIZE} height={ICON_SIZE} style={{background:'#00aeef',padding:'3px'}} />}     
                />
            </BPUI.TiledHeader>
            {
                !isProcessed ?
                <BPUI.TiledHeader>
                    <BPUI.TiledHeaderItem 
                        col={33}  
                        positions={{alignY: 'center', primary: 'center' }} 
                        colors={{  primary:'gray',secondary:'#000' }} 
                        primary={'Case Progress'}
                        secondary={(
                            <ProgressBarCustom 
                            color1 = {'#a3d556'}
                            color2 = {'#ffde00'}
                            value={ (data.all_actions - data.scheduled_actions != 0 ? (data.all_actions - data.scheduled_actions) / data.all_actions * 100: 0)}
                            />
                        )}   
                    />
                    <BPUI.TiledHeaderItem 
                        col={33}  
                        positions={ { alignY: 'center', primary: 'flex-start', secondary: 'left', iconX: 'left',  iconY: 'center' }} 
                        colors={{ primary:'gray',secondary:'#000'}} 
                        primary={'Total Balance Outstanding'}
                        secondary={`${data.total_balance}`}
                        icon={<img src={icons.cash} width={ICON_SIZE} height={ICON_SIZE} style={{background:'#8a6d95',padding:'3px'}} />}      
                    />
                    <BPUI.TiledHeaderItem 
                        col={33}  
                        positions={ { alignY: 'center', primary: 'flex-start', secondary: 'left', iconX: 'left',  iconY: 'center' }} 
                        colors={{ primary:'gray',secondary:'#000'}} 
                        primary={'Unallocated Amounts'}
                        secondary={`${data.unalloc_payment}`}    
                        icon={<img src={icons.cashflow} width={ICON_SIZE} height={ICON_SIZE} style={{background:'#57caa3',padding:'3px'}} />}   
                    />     
                </BPUI.TiledHeader> : null
            }
      </React.Fragment>)
}

function fetchAccount() {
    const ID = BPSystem.nodeKey;
    const query = `
        select 
            (select nvl(sum(b.balance),0) as balance from cs_account_balances b where b.account_strategy_id = a.account_strategy_id) as total_balance,
            (select nvl (sum (i.unallocated_amount), 0) as unallocated from payment_item i, cs_account_balances b where b.account_strategy_id = a.account_strategy_id and i.billing_profile_id = b.billing_profile_id and i.unallocated_amount != 0) as unalloc_payment, 
            to_char(max(applied_date),common_util.get_system_config('DATE_FORMAT')) as due_date,
            count(aa.account_action_id) as all_actions,
            count(case when aa.status in ('PENDING','PAUSED','IN PROGRESS') then 1 end) as scheduled_actions,
            (select count(*) from cs_account a2 where a2.account_id = a.account_id and a2.created &lt;= a.created) as times_in_collection
        from
            cs_Account a, cs_account_action aa
        where
            a.account_strategy_id = ${ID}
            and aa.account_strategy_id(+) = a.account_strategy_id
            and aa.recycle_bin_id(+) = 0
        group by
            a.account_id, a.account_strategy_id, a.created
    `;

    return BPConnection.Account
        .query(query)
        .single();
}

function getProcessedStatus() {
    const statusNode = document.querySelector('#STATUS_ROW > div');
    const statusText = statusNode ? statusNode.innerText : '';
    const isProcessed = statusText === 'PROCESSED';

    return isProcessed;
}