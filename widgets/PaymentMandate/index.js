BPSystem.initiate();

polyfillCustomEvent();
polyfillSpreadOperator();
BPUI.Tools.overrideSubmitButton({ callback: dispatchMandateSubmitEvent });

/**
 * @component Loader
 * @description Simple loader.
 * @example <Loader />
 */

const Loader = () => (
    <div class="bp-loader">
        {BPUI.Tools.arrayFromInt(12).map(() => (<div />))}
    </div>
);

const Notice = ({ errors, mandateWasChanged }) => (
    <React.Fragment>
        {
            errors &&
            <span className="formError">
                <instruction>
                    {`Failed to save GoCardless Mandate${errors.length > 1 ? ': ' : ''}${errors}`}
                </instruction>
            </span>
        }
        {
            mandateWasChanged &&
            <span className="formInfo">
                <instruction>Mandate data was changed. On submit form you will able to save changes.</instruction>
            </span>
        }
    </React.Fragment>
);
const Field = ({ readonly, field, value, ...restProps }) => (
    readonly ?
        <BPUI.OutputField field={field} {...restProps} /> :
        <BPUI.InputField value={value} {...restProps} />
);

const SelectScheme = ({ selectedSchema, schemasList, onChangeSchema }) => (
    <BPUI.Panel>
        <BPUI.PanelRow  data-type="single">
            <BPUI.PanelRowColumn>
                <PureSelect
                    className="bootstrap-select"
                    label="Schema name"
                    value={selectedSchema}
                    valuesList={schemasList}
                    onChange={e => onChangeSchema(e.target.value)}
                />
            </BPUI.PanelRowColumn>
            <BPUI.PanelRowColumn />
        </BPUI.PanelRow>
    </BPUI.Panel>
);

const PaymentMandate = ({ errors, onStateChange }) => {
    const [paymentProfile, setPaymentProfile] = React.useState(null);

    const [state, setState] = React.useState({
        loading: true,
        data: null,
        selectedSchema: null,
        schemasList: null,
        dataFields: [],
        countryCodesArr: [],
        mandateWasChanged: false,
        regionSelectorCountries: [],
    });

    const onFieldChange = (event, item) => {
        const { value: value_, checked } = event.target;
        const { type, name } = item;
        const isCountryCode = name === 'countryCode';
        const isValidCountryCode = isCountryCode && state.regionSelectorCountries.indexOf(value_) > -1;
        const enableRegionSelector = isCountryCode ? isValidCountryCode : state.data.enableRegionSelector;
        const value = ['RADIO', 'CHECKBOX'].includes(type) ? checked : value_;
        const data = Object.assign(
            state.data,
            { 
                [name]: value, 
                enableRegionSelector, 
            },
            !enableRegionSelector && { countryState: null }
        );
        const dataFields = [...state.dataFields]; // don't mutate state

        setState({ ...state, data, dataFields, mandateWasChanged: true });
    }
    const onFieldBlur = (event, item) => {
        const { value: value_, checked } = event.target;
        const { type, name, pattern } = item;
        const value = ['RADIO', 'CHECKBOX'].includes(type) ? checked : value_;
        const data = { ...state.data, [name]: value };

        setState({ ...state, data })

        if (value && pattern) {
            if (value.match(new RegExp(pattern))) {
                event.target.classList.add('success');
            } else {
                event.target.classList.add('error');
            }
        }
    }
    const onFieldFocus = (event, item) => {
        event.target.classList.remove('error');
        event.target.classList.remove('success');
    }
    const onChangeSchema = selectedSchema => {
        const dataFields = state.data && selectedSchema ? state.data[selectedSchema] : [];
        const currencyField = dataFields.find(({ name }) => name === 'currencyCode');
        const regionField = dataFields.find(({ name }) => name === 'countryState') || {};
        const regionSelectorCountries = BPUI.Tools.is.Array(regionField.countries) ? regionField.countries : [];
        const data = { 
            ...state.data, 
            countryCode: null, 
            countryState: null, 
            NationalIdentityNumber: null,
            currencyCode: currencyField.value, 
            enableRegionSelector: false
        };

        setState({
            ...state,
            data,
            dataFields,
            selectedSchema,
            regionSelectorCountries,
            currencyCode: currencyField.value
        });
    }

    const pageMode = BPUI.Tools.getPageMode();
    const dataDisplayerParams = {
        paymentProfile,
        onChangeSchema,
        onFieldChange,
        onFieldBlur,
        onFieldFocus,
        ...pageMode,
    };
    const isACHSelected = document.querySelector("#BILLING_METHOD_ROW input[value='ACH']:checked");
    const loadingErrorText = 'can not fetch critical data (currencies, countries or payment profile)';

    React.useEffect(() => {
        Promise.all([
            fetchCountryCodes(),
            fetchCurrencyCodes(),
            fetchPaymentGatewayProfileId()
        ])
            .then(([countryCodesArr, currenciesArr, paymentGatewayProfileId]) => {
                const { data, currencies } = getPaymentSchemes(countryCodesArr, currenciesArr, paymentProfile);
                const schemasList = data ? Object.keys(data) : null;
                const isReadMode = pageMode.isReadMode || pageMode.isCancelMode;
                const isCleanMode = pageMode.isNewMode || pageMode.isCopyMode;
                const defaultDataFields = getDefaultDataFields();
                let result = {
                    ...state,
                    data,
                    schemasList,
                    countryCodesArr,
                    loading: false,
                    dataFields: defaultDataFields,
                    paymentGatewayProfileId,
                };

                if (isCleanMode) {
                    const savedMandate = controlMandateState({});
                    const existingMandate = Object.assign(
                        result, 
                        isACHSelected && { ...savedMandate, mandateWasChanged: false }
                    );

                    if (!isACHSelected) controlMandateState();

                    setState(existingMandate);
                } else {
                    controlMandateState();

                    fetchBillingProfile()
                        .then(({ elements }) => {
                            const profile = BPUI.Tools.is.Array(elements) && elements[0];

                            if (!profile) return;

                            const selectedSchema = profile.AchScheme;
                            const dataFields = selectedSchema && data[selectedSchema];
                            const currencyField = dataFields && 
                                dataFields.find(({ name }) => name === 'currencyCode');
                            const currencyCode = currencyField && currencyField.value;
                            const regionField = dataFields && 
                                dataFields.find(({ name }) => name === 'countryState') || {};
                            const regionSelectorCountries = BPUI.Tools.is.Array(regionField.countries) ? regionField.countries : [];
                            const status = profile.AchMandateStatus;
                            const enableRegionSelector = 
                                BPUI.Tools.is.String(profile.AchMandateState) && 
                                profile.AchMandateState.length > 0;
                            const profileData = { 
                                ...data,
                                ...profile, 
                                countryCode: profile.AchMandateCountry,
                                countryState: profile.AchMandateState,
                                enableRegionSelector,
                                currencyCode,
                            };

                            if (BPUI.Tools.is.String(status)) {
                                profile.AchMandateStatus = status.replace(/_/g, ' ');
                            }

                            if (!dataFields && !isReadMode) {
                                result.errors = `Please change invoice currency to conform the list of available ${currencies.join(', ')}`;
                            }

                            if (dataFields) {
                                result = {
                                    ...result,
                                    data: profileData,
                                    dataFields,
                                    selectedSchema,
                                    currencyCode,
                                    regionSelectorCountries
                                };
                            } 
                            else if (isReadMode) {
                                result = {
                                    ...result,
                                    dataFields: getDefaultDataFields(profile),
                                };
                            }

                            setPaymentProfile(profile);
                        })
                        .always(() => setState(result));
                }
                

            })
            .catch(() => setState({ loading: false, loadingError: true }));
    }, []);

    React.useEffect(() => {
        onStateChange({ ...state, paymentProfile });
    }, [state]);

    return (
        state.loading ?
            <Loader /> :
            state.loadingError ?
                <Notice errors={loadingErrorText} /> :
                <DataDisplayer dataSet={{ ...state, errors }} {...dataDisplayerParams} />
    );
}

const DataDisplayer = (props) => {
    const {
        dataSet,
        isCancelMode,
        isReadMode,
        paymentProfile,
        onChangeSchema,
        onFieldChange,
        onFieldBlur,
        onFieldFocus
    } = props;
    const {
        errors,
        dataFields,
        data,
        schemasList,
        selectedSchema,
        mandateWasChanged,
        countryCodesArr,
    } = dataSet;
    const isReadOnly = isReadMode || isCancelMode;
    const canShowFields = selectedSchema || isReadOnly;
    const billingProfile = getBillingProfile(paymentProfile, data, countryCodesArr);
    const readOnlyFields = [
        { name: 'AchScheme', label: 'Schema name', type: 'TEXT' }, 
        { name: 'AchUniqueRef', label: 'Mandate ID', type: 'TEXT' },
        { name: 'AchMandateStatus', label: 'Status', type: 'TEXT' }
    ];

    const matrixRule = (items, size) => {
        const hasMatch = items.some(({ label } = {}) => ['IBAN'].indexOf(label) > -1);
        return hasMatch ? 1 : size;
    };
    const excludedFields = ['currencyCode'];
    const sanitizedFields = dataFields.filter(({ name }) => excludedFields.indexOf(name) < 0);
    const matrixFields =
        isReadOnly && selectedSchema ?
            sanitizedFields.concat(readOnlyFields) :
            sanitizedFields;

    const fieldBuckets = getMatrix(matrixFields, 2, matrixRule);
    const isValid = schemasList && BPUI.Tools.is.Array(schemasList);
    const schemasList_ = isValid ? schemasList.map(el => ({ name: el, label: getSchemaLabel(el), value: el })) : [];
    const fieldsMapping = {
        AchMandateReference: getFieldValue('ACH_MANDATE_REFERENCE')
    };
    const hasIBAN = bucket => bucket.some(({ label }) => label === 'IBAN');
    const getValue = el => el.value || data[el.name] || fieldsMapping[el.name];
    const isSelectDisabled = el => 
        isReadOnly || 
        el.disabled || 
        (el.name === 'countryState' && !data.enableRegionSelector);

    return (
        <div className={isReadOnly ? 'bp-read-mandate' : 'bp-edit-mandate'}>
            <Notice errors={errors} mandateWasChanged={mandateWasChanged} />
            {
                !isReadOnly && 
                <SelectScheme {...{ selectedSchema, schemasList: schemasList_, onChangeSchema }} />
                
            }
            <BPUI.Panel>
                {
                    canShowFields ?
                    fieldBuckets.map((fieldBucket, bucketIndex) => {
                        const isIBAN = hasIBAN(fieldBucket);
                        const shouldAddEmptyColumn = fieldBucket.length === 1 && !isIBAN;

                        return (
                            <BPUI.PanelRow 
                                data-iban={isIBAN} 
                                data-type={fieldBucket.length > 1 ? 'multi' : 'single'}
                            >
                                {fieldBucket.map((el, i) => (
                                    <BPUI.PanelRowColumn>
                                        {
                                            !isReadOnly && el.type === "SELECT1" ?
                                                <PureSelect
                                                    key={i + bucketIndex}
                                                    className="bootstrap-select"
                                                    value={el.value || data[el.name] || dataSet[el.name]}
                                                    valuesList={el.valuesList}
                                                    label={el.label}
                                                    disabled={isSelectDisabled(el)}
                                                    onChange={e => onFieldChange(e, el)}
                                                /> :
                                                <Field
                                                    key={i + bucketIndex}
                                                    field={getMappedFieldName(el.name, true)}
                                                    name={getMappedFieldName(el.name, true)}
                                                    type={el.type}
                                                    readonly={isReadOnly}
                                                    value={getValue(el)}
                                                    required={el.required}
                                                    variable={billingProfile}
                                                    label={el.label}
                                                    disabled={el.disabled}
                                                    onChange={e => onFieldChange(e, el)}
                                                    onBlur={e => onFieldBlur(e, el)}
                                                    onFocus={e => onFieldFocus(e, el)}
                                                />
                                        }
                                    </BPUI.PanelRowColumn>
                                ))}
                                { shouldAddEmptyColumn && <BPUI.PanelRowColumn /> }
                            </BPUI.PanelRow>
                        );
                    }) : null
                }
            </BPUI.Panel>
        </div>
    )
}

const PureSelect = ({ valuesList, onChange, disabled, label, value, className, notSelectedLabel }) => {
    const notSelectedLabel_ = notSelectedLabel || '- NOT SELECTED -';
    const options = valuesList && BPUI.Tools.is.Array(valuesList) ? valuesList : [];
    const valuesList_ = [
        { name: '', label: notSelectedLabel_, value: -1, disabled: true },
        ...options
    ];

    return (
        <div className="form-group widget-field" name={`${label}_ROW`}>
            <label className="col-sm-5 control-label" align="right"><nobr><span>{label}</span></nobr></label>
            <div className="col-sm-7">
                <select
                    disabled={disabled}
                    className={className}
                    value={value || -1}
                    onChange={e => onChange(e)}
                >
                    {
                        disabled ?
                            <option key={value} selected>{value}</option> :
                            valuesList_.map((el, i) => <option selected={el.id == value} key={i} {...el}>{el.label}</option>)
                    }
                </select>
            </div>
        </div>
    )
}

/* Renderers */

function paymentMandateRender(props) {
    const hasProps = Object.keys(props).length > 0;
    const modifiedProps = hasProps && Object.assign(props, { onStateChange: props.onStateChange.bind(this) });
    const handleClose = () => this.setState({ showPrompt: false });
    const handleCancel = () => this.setState({ showPrompt: false }, () => makeXMLsubmit());
    const handleProceed = () => this.setState({ showPrompt: false }, submitMandate.bind(this));
    const promptHeader = 'Mandate Update';
    const promptContent = `You've updated field belonging to a direct debit mandate, the system will submit augmented mandate to GoCardless.\nDo you want proceed?`;

    return (
        hasProps ? 
        <React.Fragment>
            <PaymentMandate errors={this.state.errors} {...modifiedProps} />
            <BPUI.PureDialog
                open={this.state.showPrompt} 
                title={promptHeader}
                content={promptContent}
                footer={
                    <BPUI.NavToolBar className="modal-footer"> 
                        <BPUI.Button title="Proceed" className="formButton" onClick={handleProceed} />
                        <BPUI.Button title="Cancel" onClick={handleCancel} />
                    </BPUI.NavToolBar>
                }
                onClose={handleClose}
            /> 
        </React.Fragment> 
        : null
    );
}

/* API Layer */

function fetchPaymentToken({
    AchBankAcctName,
    bankAccountTokenization,
    paymentGatewayProfileId,
    customerData,
}) {
    const paymentGatewayCustomerId = `${BPUI.Tools.hash()}${Date.now()}`; //generate random hash BPUI.Tools.hash()
    const url = `paymentgateways/1.0/tokenize`;
    const body = JSON.stringify({
        schemaName: 'r9dev', // will be dropped
        paymentGatewayProfileId, //remove hardcode
        paymentGatewayCustomerId,
        bankAccountTokenization,
        accountHolderName: AchBankAcctName,
        customerData,
    });
    const params = {
        body,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            sessionId: window.BPSystem.sessionId
        },
    };

    return fetch(url, params)
        .then(handleFetchRequest);
}

function fetchCountryCodes() {
    const countryNames = [
        'Austria', 'Canada', 'Cyprus',
        'Denmark', 'Finland', 'France',
        'Greece', 'Italy', 'Lithuania',
        'Luxembourg', 'Monaco', 'Netherlands',
        'New Zealand', 'Portugal', 'San Marino',
        'Slovak Republic', 'Slovenia', 'Spain',
        'United States', 'UK', 'Australia',
        'Germany', 'Ireland', 'Latvia',
        'Malta', 'Sweden', 'USA',
        'United Kingdom',
    ];
    const countriesSQLList = countryNames.map(countryName => `'${countryName}'`).join(', ');
    const filter = `CountryName IN (${countriesSQLList})`;

    return BPConnection.Country
        .retrieveFilteredAsync(filter)
        .collection()
        .then(mapCountryCodes)
}

function fetchCurrencyCodes() {
    return BPConnection.Currency
        .retrieveFilteredAsync("Id IS NOT NULL")
        .collection()
        .then(({ elements }) => elements.map(el => ({
            ...el,
            id: el.Id,
            name: el.Id,
            label: `${el.CurrencyName}(${el.Id})`,
            value: el.Id
        })));
}

function fetchPaymentGatewayProfileId() {
    const query = `
        select
            g.Id as PaymentGatewayId,
            (
            select
                gp.Id 
            from
                payment_gateway_profile gp 
            where
                gp.PaymentGatewayId = g.Id 
                and gp.Status = 'ACTIVE' 
            )
            as PaymentGatewayProfileId 
        from
            payment_gateway g 
        where g.Status = 'ACTIVE' 
            and g.GATEWAY_NAME = 'GOCARDLESS'
            and g.ProcessType = 'SERVICE'
    `;

    return request(query)
        .then(({ elements }) => {
            const { PaymentGatewayProfileId } = BPUI.Tools.is.Array(elements) ? elements[0] : {};
            return PaymentGatewayProfileId;
        });
}

function fetchBillingProfile() {
    const accountId = window.BPSystem.nodeKey; //70921
    const query = `
      SELECT
      AccountId,
      AchBankAcctName,
      CurrencyCode,
      Country,
      City,
      BillingMethod,
      AchScheme,
      AchBankName,
      AchBankAcctNum,
      AchMandateCountry,
      AchMandateState,
      AchMandateReference,
      AchBranchCode,
      NationalIdentityNumber,
      AchBankAbaCode,
      AchBankAcctType,
      AchUniqueRef,
      AchEcheckType,
      AchMandateStatus
      FROM BILLING_PROFILE
      WHERE AccountObj.Id=${accountId}
    `;

    return request(query);
}

function request(query, errorHandler) {
    const handleError = BPUI.Tools.is.Function(errorHandler) ?
        errorHandler :
        handleRequestError;

    return window.BPConnection
        .BillingProfile
        .queryAsync(query)
        .collection()
        .done(response => response)
        .fail(handleError)
}

function handleRequestError({ status }) {
    console.warn(`Payment Mandate request failed with status ${status}`);
}

function handleFetchRequest(res) {
    return res.ok ? res.json() : Promise.reject(res);
}


/* Utils */

function onMandateChange(state) {
    const {
        data,
        paymentProfile,
        selectedSchema,
        mandateWasChanged,
        paymentGatewayProfileId,
    } = state;
    const {
        AchBankName,
        AchBankAcctName,
        countryCode,
        countryState,
        currencyCode,
        AchBankAcctType,
        AchBankAcctNum,
        AchBankAbaCode,
        NationalIdentityNumber,
        AchBranchCode,
    } = data || {};
    const shouldAddIBAN = /^(sepa_core)$/g.test(selectedSchema);
    const bankAccountTokenization = Object.assign(
        {
            countryCode,
            currencyCode,
            accountScheme: selectedSchema,
            accountType: AchBankAcctType,
            accountNumber: AchBankAcctNum,
            bankCode: AchBankAbaCode,
            branchCode: AchBranchCode,
        }, 
        shouldAddIBAN && { iban: AchBankAcctNum },
        NationalIdentityNumber && { identityNumber: NationalIdentityNumber }
    );
    const mandate = {
        AchBankAcctName,
        AchBankName,
        countryState,
        bankAccountTokenization,
        paymentGatewayProfileId,
    };

    
    this.mandateState = state;
    this.mandate = mandate;
    this.isUpdated = mandateWasChanged;
    this.isExisting = 
        mandateWasChanged &&
        paymentProfile && 
        BPUI.Tools.is.String(paymentProfile.AchScheme);
}

function onMandateSubmit() {
    if (this.isExisting) {
        this.setState({ showPrompt: true });
    } else {
        submitMandate.call(this);
    }
}

function submitMandate() {
    const { 
        errors,
        AchBankName, 
        AchBankAcctName, 
        countryState,
        bankAccountTokenization, 
        ...restMandate 
    } = this.mandate;
    const {
        identityNumber, 
        accountScheme,
        accountNumber, 
        branchCode, 
        countryCode, 
        currencyCode, 
        accountType, 
        bankCode,
        iban,
    } = bankAccountTokenization;
    const { isNewMode } = BPUI.Tools.getPageMode();
    const paymentData = getPaymentData(AchBankAcctName);
    const customerData = { ...paymentData, countryCode, state: countryState };
    const accountCurrency = getAccountCurrency();
    const isValidCurrency = currencyCode === accountCurrency;
    const hasErrors = !!this.state.errors && this.state.errors.length > 0;
    const hasSavedMandate = isNewMode && controlMandateState({});
    const shouldFetchToken = 
        (isValidCurrency && this.isUpdated) || 
        (!hasSavedMandate && !hasErrors && this.isUpdated);
    const currencyErrorText = `Invoice currency (${accountCurrency}) isn't compatible with the currency implied by the ${accountScheme} mandate.\nEither change invoice currency, set different scheme on mandate or change payment method`;

    if (!isValidCurrency) {
        return this.setState({ errors: currencyErrorText });
    }

    if (shouldFetchToken) {
        fetchPaymentToken({ 
            AchBankAcctName, 
            bankAccountTokenization: { 
                ...bankAccountTokenization, 
                currencyCode: accountCurrency 
            }, 
            customerData, 
            ...restMandate 
        })
            .then(({ 
                accountToken,
                tokenStatus,
                tokenRefNumber, 
                additionalAttributes, 
                errorMessage 
            }) => {
                const { paymentGatewayCustomerId } = additionalAttributes || {};
                
                controlFieldsValues({
                    accountName: ['ACH_BANK_ACCT_NAME', AchBankAcctName],
                    achAccountType: ['ACH_BANK_ACCT_TYPE', iban ? 'IBAN' : accountType],
                    achAccountNumber: ['ACH_BANK_ACCT_NUM', accountNumber],
                    achBankCode: ['ACH_BANK_ABA_CODE', bankCode],
                    achBankName: ['ACH_BANK_NAME', AchBankName],
                    branch: ['ACH_BRANCH_CODE', branchCode],
                    country: ['ACH_MANDATE_COUNTRY', countryCode],
                    scheme: ['ACH_SCHEME', accountScheme],
                    status: ['ACH_MANDATE_STATUS', tokenStatus],
                    tokenRef: ['ACH_MANDATE_REFERENCE', tokenRefNumber],
                    countryState: ['ACH_MANDATE_STATE', countryState],
                    achUniqRef: ['ACH_UNIQUE_REF', accountToken],
                    nationalIdentity: ['NATIONAL_IDENTITY_NUMBER', identityNumber],
                    paymentGatewayProfileRef: ['PAYMENT_GATEWAY_PROFILE_REF', paymentGatewayCustomerId],
                }, true);
                setWalletGatewayData(additionalAttributes);

                if (errorMessage) {
                    this.setState({ errors: errorMessage });
                } else {
                    this.setState({ errors: null }, () => {
                        window.isSubmitted = true;

                        controlMandateState(this.mandateState);
                        resetClickCounter();
                        makeXMLsubmit();
                    });
                }
            })
            .catch(err => this.setState({ errors: ' ' }));
    } else {
        window.isSubmitted = true;

        resetClickCounter();
        makeXMLsubmit();
    }
}

function controlMandateState(state) {
    const id = 'GC_MANDATE';
    const isValidState = BPUI.Tools.is.Object(state);
    const shouldGet = isValidState && Object.keys(state).length === 0;
    const shouldSave = isValidState && Object.keys(state).length > 0;
    let result = null;
    
    try {
        if (shouldGet) {
            result = JSON.parse(localStorage.getItem(id));
        }
        else if (shouldSave) {
            localStorage.setItem(id, JSON.stringify(state));      
        } else {
            localStorage.removeItem(id);
        }
    } catch (error) {
        console.warn(`Couldn't ${shouldSave ? 'save' :  shouldGet ? 'get' : 'remove'} GoCardless mandate state`);
    } finally {
        return result;
    }
}

function dispatchMandateSubmitEvent(e) {
    const selector = '#BILLING_METHOD_ROW input[type="radio"]:checked';
    const isVisible = isElementVisible(document.getElementById('bpui-gcpm-extension'));
    const event = new CustomEvent('submitMandate');

    if (!isVisible || window.isSubmitted) {
        const billingMethodElement = document.querySelector(selector);
        const shouldCallSubmit = 
            billingMethodElement && 
            billingMethodElement.value && 
            billingMethodElement.value === 'MAIL';
        
        return shouldCallSubmit ? makeXMLsubmit() : null;
    }

    e.preventDefault();
    e.stopPropagation();

    window.resetClickCounter();
    $('*').css('cursor', '');

    window.dispatchEvent(event);
}

function getBillingProfile(paymentProfile, data, countryCodesArr) {
    const mappingKeys = { 
        AchMandateCountry: 'countryCode',
        AchMandateState: 'countryState',
        AchScheme: 'schema' 
    };
    const mapData = { ...paymentProfile, ...data, countryCodesArr };
    let result = {};

    if (paymentProfile) {
        result = Object.keys(paymentProfile)
            .reduce((acc, key) => {
                const value = paymentProfile[key];
                const mapKey = mappingKeys[key];
                const mapValue = mapKey && 
                    getMappedFieldValue(mapKey, { ...mapData, [mapKey]: value });

                return ({ ...acc, [key]: mapValue || value })
            }, 
            {});
    }

    return new BPUI.ReferenceObject(BPSystem.toBPObject(result, BPConnection.BillingProfile));
}

function getPaymentData(AchBankAcctName) {
    const {
        zipCode,
        addressLine1,
        addressLine2,
        city,
        email,
    } = controlFieldsValues({
        zipCode: 'ZIP',
        addressLine1: 'ADDR1',
        addressLine2: 'ADDR2',
        city: 'CITY',
        email: 'EMAIL',
    });
    const [
        customerGivenName,
        customerFamilyName
    ] = (AchBankAcctName || '').match(/\S+/g) || [];
    const additionalAttributes = getWalletGatewayData();
    const customerData = {
        zipCode,
        addressLine1,
        addressLine2,
        city,
        email,
        customerGivenName,
        customerFamilyName,
        additionalAttributes,
    };

    return customerData;
}

function getSchemaLabel(schema) {
    const schemaLabels = {
        ach: 'ACH',
        autogiro: 'Autogiro',
        bacs: 'Bacs',
        becs: 'BECS',
        becs_nz: 'BECS NZ',
        betalingsservice: 'Betalingsservice',
        pad: 'PAD',
        sepa_core: 'SEPA'
    };

    return schemaLabels[schema];
}

function getMatrix(arr, size, rule) {
    const result = [];
    let bucketSize = size;

    for (let i = 0; i < arr.length; i += bucketSize) {
        if (BPUI.Tools.is.Function(rule)) {
            bucketSize = rule(arr.slice(i, i + bucketSize), size);
        }

        result.push(arr.slice(i, i + bucketSize));
    }

    return result;
};

function getMappedFieldName(name, returnOnlyName) {
    const names = {
        countryCode: {
            field: 'AchMandateCountry',
            mapper: data => {
                const { countryCodesArr, countryCode } = data;
                const code = countryCodesArr.find(({ Alpha2_Code }) => Alpha2_Code === countryCode);
                return code ? code.label : data.AchMandateCountry;
            }
        },
        countryState: {
            field: 'AchMandateState',
            mapper: data => {
                const { AchScheme, countryState } = data;
                const schema = data[AchScheme];
                const field = 
                    BPUI.Tools.is.Array(schema) ? 
                    schema.find(({ name }) => name === 'countryState') : {};
                const code = field && 
                    BPUI.Tools.is.Array(field.valuesList) && 
                    field.valuesList.find(({ name }) => name === countryState);
                
                return code ? code.label : data.AchMandateState;
            }
        },
        schema: {
            field: 'AchScheme',
            mapper: data => {
                const { AchScheme } = data;
                const pageMode = BPUI.Tools.getPageMode();
                const isReadMode = pageMode.isReadMode || pageMode.isCancelMode;
                const shouldDisplayLabel = AchScheme && isReadMode;
                const label = getSchemaLabel(AchScheme);

                return shouldDisplayLabel ? label : AchScheme;
            }
        }
    };
    let result = names[name] || {}; 

    if (returnOnlyName) {
        result = names[name] ? names[name].field : name;
    }

    return result;
}

function getMappedFieldValue(name, data) {
    const { field, mapper } = getMappedFieldName(name);
    const fieldName = field || name;
    const mappedValue = mapper && mapper(data);
    const fieldValue = mappedValue || data[fieldName] || '';

    return fieldValue;
};

function getFieldValue(name, defautlValue, modifier = '') {
    const node = document.querySelector(`[name=${name}]${modifier}`);
    const value = node && node.value;
    const fallback = !value && defautlValue;

    if (!value) {
        console.warn(`Value for field with name ${name} is not found`);
    }

    return fallback ? defautlValue : value;
}

function setFieldValue(name, fieldValue, modifier = '') {
    const node = document.querySelector(`[name=${name}]${modifier}`);
    const isSuccess = name && fieldValue && node;

    if (name && fieldValue) {
        if (node) {
            node.value = fieldValue
        } else {
            console.warn(`Field with name ${name} is not found`);
        }
    } else {
        console.warn('Field name and value should not be blank');
    }

    return isSuccess;
}

function controlFieldsValues(fieldNames, shouldSet) {
    const isValid = BPUI.Tools.is.Object(fieldNames);
    let result = {};

    if (isValid) {
        result = Object.keys(fieldNames).reduce((acc, key) => {
            const field = fieldNames[key];
            const isParamsSet = field && BPUI.Tools.is.Array(field);

            if (field) {
                const param = isParamsSet ? field : [field];
                const fieldValue = 
                    shouldSet ? 
                    setFieldValue(...param) : 
                    getFieldValue(...param);

                acc[key] = fieldValue;
            }

            return acc;
        }, {});
    }

    return result;
}

function isElementVisible(elem) {
    if (!(elem instanceof Element)) {
        console.warn('isElementVisible function accept only valid DOM Node');
    } else {
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }
}

function polyfillCustomEvent() {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    window.CustomEvent = CustomEvent;
}

function polyfillSpreadOperator() {
    React.__spread = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        } return target;
    };
}

function getDefaultDataFields(entity) {
    const { data } = getPaymentSchemes([], [], entity);
    const fieldsMap = Object.keys(data).reduce((acc, schemeName) => {
        const scheme = data[schemeName];

        const mapped = scheme.reduce((fields, field) => {
            const { value, ...fieldValues } = field;

            if (!fields[field.name]) {
                fields[field.name] = { ...fieldValues };
            }
            return fields;
        }, acc);

        return mapped;
    }, {});
    const entityFields = Object.keys(fieldsMap);
    const dataFields = entityFields.map(fieldName => ({
        name: fieldName,
        label: fieldName,
        value: entity ? entity[fieldName] : '',
        ...fieldsMap[fieldName],
    }));

    return dataFields;
}

function getWalletGatewayData() {
    const tableRows = document.querySelectorAll('#WALLET_GATEWAY_DATA_ROW table tbody tr');
    let result = {};

    if (tableRows) {
        result = Array.from(tableRows).reduce((acc, row) => {
            const rowValues = row.querySelectorAll('input');
            const [key, value] = rowValues ? Array.from(rowValues).map(el => el.value) : [];
            const isValidKey = key.replace(/\s/g, '').length > 0;

            return Object.assign(acc, isValidKey && { [key]: value });
        }, {});
    }

    return result;
}

function setWalletGatewayData(data) {
    const isValid = BPUI.Tools.is.Object(data);
    const hiddenInput = document.querySelector('[name="WALLET_GATEWAY_DATA"]');
    const recordTemplate = (key, value) => `<KEY>${key}</KEY><VALUE>${value}</VALUE>`;

    if (isValid && hiddenInput) {
        const result = Object.keys(data).reduce((acc, key) =>
            `${acc}<WALLET_GATEWAY_DATA_ROW>${recordTemplate(key, data[key])}</WALLET_GATEWAY_DATA_ROW>`,
            ''
        );

        setFieldValue('WALLET_GATEWAY_DATA', `<![CDATA[<WALLET_GATEWAY_DATA>${result}</WALLET_GATEWAY_DATA>]]>`);
    }
}

function getAccountCurrency() {
    const currencySelector = document.querySelector('select[name="CURRENCY"]'); 
    const currency = currencySelector && currencySelector[currencySelector.selectedIndex].value;

    return currency;
}

function mapCountryCodes({ elements }) {
    return elements.map(el => (
        {
            ...el,
            name: el.CountryName,
            label: el.CountryName,
            id: el.Id,
            value: el.Alpha2_Code || el.Code,
        }
    ))
}

/* Payment schemes */

function getPaymentSchemes(countryCodesArr, currenciesArr, paymentProfile) {
    const { isNewMode, isReadMode, isCancelMode, isWidget } = BPUI.Tools.getPageMode();
    const isReadOnly = isReadMode || isCancelMode;
    const shouldCheckCurrency = isNewMode || isReadOnly;
    const accountCurrency = getAccountCurrency();
    const profileCurrency = BPUI.Tools.is.Object(paymentProfile) && paymentProfile.CurrencyCode;
    const profileCurrencyCode = isReadOnly && profileCurrency && [profileCurrency];
    const usStates = getUSStates();
    const australiaStates = getAustraliaStates();
    const nzStates = getNZStates();
    const currencyCodes = profileCurrencyCode || currenciesArr.map(({ Id }) => Id);
    const accountTypeArr = [
        { name: 'Checking', label: 'Checking', id: 1, value: 'checking' },
        { name: 'Savings', label: 'Savings', id: 2,value: 'savings' },
    ];
    const schemes = {
        ach: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Account Number', type: 'TEXT', required: false, },
            { name: 'AchBankAbaCode', label: 'Routing Number', type: 'TEXT', required: false, },
            { name: 'AchBankAcctType', label: 'Account Type', type: 'SELECT1', required: false, valuesList: accountTypeArr },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'countryState', label: 'State', type: 'SELECT1', countries: ['US'], required: true, valuesList: usStates },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "USD", valuesList: currenciesArr },
        ],
        autogiro: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Kontonummer', type: 'TEXT', required: false, },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'AchBranchCode', label: 'Clearingnummer', type: 'TEXT', required: false, },
            { name: 'NationalIdentityNumber', label: 'Personnummer', type: 'TEXT', required: true },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "SEK", valuesList: currenciesArr },
        ],
        bacs: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Account Number', type: 'TEXT', required: false, },
            { name: 'AchBranchCode', label: 'Sort Code', type: 'TEXT', required: true, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "GBP", valuesList: currenciesArr },
        ],
        becs: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Account Number', type: 'TEXT', required: false, },
            { name: 'AchBranchCode', label: 'BSB', type: 'TEXT', required: false, },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'countryState', label: 'State', type: 'SELECT1', countries: ['AU'], required: true, valuesList: australiaStates },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "AUD", valuesList: currenciesArr },
        ],
        becs_nz: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Account Number', type: 'TEXT', required: false, },
            { name: 'AchBankAbaCode', label: 'Bank Number', type: 'TEXT', required: false, },
            { name: 'AchBranchCode', label: 'Branch Number', type: 'TEXT', required: false, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'countryState', label: 'State', type: 'SELECT1', countries: ['NZ'], required: true, valuesList: nzStates },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "NZD", valuesList: currenciesArr },
        ],
        betalingsservice: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Kontonummer', type: 'TEXT', required: false, },
            { name: 'AchBankAbaCode', label: 'Registreringsnummer', type: 'TEXT', required: false, },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'NationalIdentityNumber', label: 'CPR-nummer', type: 'TEXT', required: true },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "DKK", valuesList: currenciesArr },
        ],
        pad: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchBankAcctNum', label: 'Account Number', type: 'TEXT', required: false, },
            { name: 'AchBankAbaCode', label: 'Financial Institution Number', type: 'TEXT', required: false, },
            { name: 'AchBranchCode', label: 'Branch Transit Number', type: 'TEXT', required: false, },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "CAD", valuesList: currenciesArr },
        ],
        sepa_core: [
            { name: 'AchBankAcctName', label: 'Account Holder Name', type: 'TEXT', required: true },
            { name: 'AchMandateReference', label: 'Mandate Reference #', disabled: true, type: 'TEXT', required: false, },
            { name: 'AchBankAcctNum', label: 'IBAN', type: 'TEXT', required: true },
            { name: 'countryCode', label: 'Country', type: 'SELECT1', required: true, disabled: false, valuesList: countryCodesArr },
            { name: 'currencyCode', label: 'Currency', type: 'SELECT1', required: true, disabled: true, value: "EUR", valuesList: currenciesArr },
        ],
    };

    const result = Object.keys(schemes).reduce((acc, key) => {
        const scheme = schemes[key];
        const currencyField = scheme.find(({ name }) => name === 'currencyCode');
        const currency = currencyField && currencyField.value;
        const isValidCurrency = currencyCodes.indexOf(currency) > -1;

        const isNewAccount = shouldCheckCurrency && isValidCurrency;
        const isExistingAccount = !shouldCheckCurrency && (accountCurrency === currency);
        const isWidgetMode = isWidget && isValidCurrency;

        const currencies = acc.currencies.concat(currency);
        let data = acc.data;

        if (isNewAccount || isExistingAccount || isWidgetMode) {
            data = Object.assign(acc.data, {[key]: scheme});
        }

        return { data, currencies };
    }, { data: {}, currencies: [] });

    return result;
}

/* Country regions */

function getUSStates() {
    const states = [
        {
          "label": "Alabama",
          "name": "AL",
          "value": "AL"
        },
        {
          "label": "Alaska",
          "name": "AK",
          "value": "AK"
        },
        {
          "label": "American Samoa",
          "name": "AS",
          "value": "AS"
        },
        {
          "label": "Arizona",
          "name": "AZ",
          "value": "AZ"
        },
        {
          "label": "Arkansas",
          "name": "AR",
          "value": "AR"
        },
        {
          "label": "California",
          "name": "CA",
          "value": "CA"
        },
        {
          "label": "Colorado",
          "name": "CO",
          "value": "CO"
        },
        {
          "label": "Connecticut",
          "name": "CT",
          "value": "CT"
        },
        {
          "label": "Delaware",
          "name": "DE",
          "value": "DE"
        },
        {
          "label": "District Of Columbia",
          "name": "DC",
          "value": "DC"
        },
        {
          "label": "Federated States Of Micronesia",
          "name": "FM",
          "value": "FM"
        },
        {
          "label": "Florida",
          "name": "FL",
          "value": "FL"
        },
        {
          "label": "Georgia",
          "name": "GA",
          "value": "GA"
        },
        {
          "label": "Guam",
          "name": "GU",
          "value": "GU"
        },
        {
          "label": "Hawaii",
          "name": "HI",
          "value": "HI"
        },
        {
          "label": "Idaho",
          "name": "ID",
          "value": "ID"
        },
        {
          "label": "Illinois",
          "name": "IL",
          "value": "IL"
        },
        {
          "label": "Indiana",
          "name": "IN",
          "value": "IN"
        },
        {
          "label": "Iowa",
          "name": "IA",
          "value": "IA"
        },
        {
          "label": "Kansas",
          "name": "KS",
          "value": "KS"
        },
        {
          "label": "Kentucky",
          "name": "KY",
          "value": "KY"
        },
        {
          "label": "Louisiana",
          "name": "LA",
          "value": "LA"
        },
        {
          "label": "Maine",
          "name": "ME",
          "value": "ME"
        },
        {
          "label": "Marshall Islands",
          "name": "MH",
          "value": "MH"
        },
        {
          "label": "Maryland",
          "name": "MD",
          "value": "MD"
        },
        {
          "label": "Massachusetts",
          "name": "MA",
          "value": "MA"
        },
        {
          "label": "Michigan",
          "name": "MI",
          "value": "MI"
        },
        {
          "label": "Minnesota",
          "name": "MN",
          "value": "MN"
        },
        {
          "label": "Mississippi",
          "name": "MS",
          "value": "MS"
        },
        {
          "label": "Missouri",
          "name": "MO",
          "value": "MO"
        },
        {
          "label": "Montana",
          "name": "MT",
          "value": "MT"
        },
        {
          "label": "Nebraska",
          "name": "NE",
          "value": "NE"
        },
        {
          "label": "Nevada",
          "name": "NV",
          "value": "NV"
        },
        {
          "label": "New Hampshire",
          "name": "NH",
          "value": "NH"
        },
        {
          "label": "New Jersey",
          "name": "NJ",
          "value": "NJ"
        },
        {
          "label": "New Mexico",
          "name": "NM",
          "value": "NM"
        },
        {
          "label": "New York",
          "name": "NY",
          "value": "NY"
        },
        {
          "label": "North Carolina",
          "name": "NC",
          "value": "NC"
        },
        {
          "label": "North Dakota",
          "name": "ND",
          "value": "ND"
        },
        {
          "label": "Northern Mariana Islands",
          "name": "MP",
          "value": "MP"
        },
        {
          "label": "Ohio",
          "name": "OH",
          "value": "OH"
        },
        {
          "label": "Oklahoma",
          "name": "OK",
          "value": "OK"
        },
        {
          "label": "Oregon",
          "name": "OR",
          "value": "OR"
        },
        {
          "label": "Palau",
          "name": "PW",
          "value": "PW"
        },
        {
          "label": "Pennsylvania",
          "name": "PA",
          "value": "PA"
        },
        {
          "label": "Puerto Rico",
          "name": "PR",
          "value": "PR"
        },
        {
          "label": "Rhode Island",
          "name": "RI",
          "value": "RI"
        },
        {
          "label": "South Carolina",
          "name": "SC",
          "value": "SC"
        },
        {
          "label": "South Dakota",
          "name": "SD",
          "value": "SD"
        },
        {
          "label": "Tennessee",
          "name": "TN",
          "value": "TN"
        },
        {
          "label": "Texas",
          "name": "TX",
          "value": "TX"
        },
        {
          "label": "Utah",
          "name": "UT",
          "value": "UT"
        },
        {
          "label": "Vermont",
          "name": "VT",
          "value": "VT"
        },
        {
          "label": "Virgin Islands",
          "name": "VI",
          "value": "VI"
        },
        {
          "label": "Virginia",
          "name": "VA",
          "value": "VA"
        },
        {
          "label": "Washington",
          "name": "WA",
          "value": "WA"
        },
        {
          "label": "West Virginia",
          "name": "WV",
          "value": "WV"
        },
        {
          "label": "Wisconsin",
          "name": "WI",
          "value": "WI"
        },
        {
          "label": "Wyoming",
          "name": "WY",
          "value": "WY"
        }
    ];

    return states;
}

function getAustraliaStates() {
    const states = [
        {
          "name": "AU-ACT",
          "label": "Australian Capital Territory",
          "value": "AU-ACT"
        },
        {
          "name": "AU-NSW",
          "label": "New South Wales",
          "value": "AU-NSW"
        },
        {
          "name": "AU-NT",
          "label": "Northern Territory",
          "value": "AU-NT"
        },
        {
          "name": "AU-QLD",
          "label": "Queensland",
          "value": "AU-QLD"
        },
        {
          "name": "AU-SA",
          "label": "South Australia",
          "value": "AU-SA"
        },
        {
          "name": "AU-TAS",
          "label": "Tasmania",
          "value": "AU-TAS"
        },
        {
          "name": "AU-VIC",
          "label": "Victoria",
          "value": "AU-VIC"
        },
        {
          "name": "AU-WA",
          "label": "Western Australia",
          "value": "AU-WA"
        }
    ]

    return states;
}

function getNZStates() {
    const states = [
        {
          "name": "NZ-AUK",
          "label": "Auckland",
          "value": "NZ-AUK"
        },
        {
          "name": "NZ-BOP",
          "label": "Bay of Plenty",
          "value": "NZ-BOP"
        },
        {
          "name": "NZ-CAN",
          "label": "Canterbury",
          "value": "NZ-CAN"
        },
        {
          "name": "NZ-GIS",
          "label": "Gisborne",
          "value": "NZ-GIS"
        },
        {
          "name": "NZ-HKB",
          "label": "Hawke's Bay",
          "value": "NZ-HKB"
        },
        {
          "name": "NZ-MBH",
          "label": "Marlborough",
          "value": "NZ-MBH"
        },
        {
          "name": "NZ-MWT",
          "label": "Manawatu-Wanganui",
          "value": "NZ-MWT"
        },
        {
          "name": "NZ-NSN",
          "label": "Nelson",
          "value": "NZ-NSN"
        },
        {
          "name": "NZ-NTL",
          "label": "Northland",
          "value": "NZ-NTL"
        },
        {
          "name": "NZ-OTA",
          "label": "Otago",
          "value": "NZ-OTA"
        },
        {
          "name": "NZ-STL",
          "label": "Southland",
          "value": "NZ-STL"
        },
        {
          "name": "NZ-TAS",
          "label": "Tasman",
          "value": "NZ-TAS"
        },
        {
          "name": "NZ-TKI",
          "label": "Taranaki",
          "value": "NZ-TKI"
        },
        {
          "name": "NZ-WKO",
          "label": "Waikato",
          "value": "NZ-WKO"
        },
        {
          "name": "NZ-WGN",
          "label": "Wellington",
          "value": "NZ-WGN"
        },
        {
          "name": "NZ-WTC",
          "label": "West Coast",
          "value": "NZ-WTC"
        },
        {
          "name": "NZ-CIT",
          "label": "Chatham Islands Territory",
          "value": "NZ-CIT"
        }
    ];

    return states;
}