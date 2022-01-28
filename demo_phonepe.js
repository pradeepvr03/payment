

let request;
 
/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
    console.log("3. buildPaymentRequest() -> START ");
    if (!window.PaymentRequest) {
        return null;
    }

    const supportedInstruments = [{
        supportedMethods: "https://mercury-uat.phonepe.com/transact/pay",
        // For PreProd: "https://mercury-uat.phonepe.com/transact/pay",
        // For Prod: "https://mercury-t2.phonepe.com/transact/pay",

        data: {
            url: "redirectUrl"        //redirect url from v4/debit response
        }
    }];

    const details = {
        id: "1111-71ca4e9f-748c-4de7-af7b-a84f3da75b4e-temp",       //A unique id [optional], if not passed browser will generate one
        total: {
        label: 'Total',
        amount: {
            currency: 'INR',
            value: '100',
        }
        }
    };

    try {
        console.log("3. buildPaymentRequest() :: TRY");
        request = new PaymentRequest(supportedInstruments, details);
        if (typeof request.hasEnrolledInstrument === 'function') {
            console.log("3. buildPaymentRequest() :: IF START");
            request.hasEnrolledInstrument().then(function(result) {
                if(result) {
                    console.log("3. buildPaymentRequest() :: hasEnrolledInstrument() :: Show “Pay By PhonePe” button in payment options with result", result);
                    //Show “pay by Phonepe” button in payment options
                } else {
                    console.log("3. buildPaymentRequest() :: hasEnrolledInstrument() :: Don't Show “Pay By PhonePe” with result", result);
                }
            }).catch(function(err) {
                console.log("3. buildPaymentRequest() :: CATCH: hasEnrolledInstrument() with error : ", err);
                handleError(err);     //handle error
            });
            console.log("3. buildPaymentRequest() :: IF END");
        } else {
            console.log("3. buildPaymentRequest() :: ELSE START");
            request.canMakePayment().then(function(result) {
              if(result) {
               console.log("3. buildPaymentRequest() :: canMakePayment() :: Show “Pay By PhonePe” button in payment options with result", result);
               //Show “pay by Phonepe” button in payment options
              } else {
                    console.log("3. buildPaymentRequest() :: canMakePayment() :: Don't Show “Pay By PhonePe” with result", result);
                }
            }).catch(function(err) {
              console.log("3. buildPaymentRequest() :: CATCH: hasEnrolledInstrument() with error : ", err);
              handleError(err);
            });
            console.log("3. buildPaymentRequest() :: ELSE END");
        }
        
    } catch (e) {
        console.log("3. buildPaymentRequest() :: CATCH: hasEnrolledInstrument() with error : ", e);
        handleError(e);
    }
    console.log("3. buildPaymentRequest() -> END");
}
  
/**
 * Create payment request object for Phonepe payment.
 */
function onCheckoutClick(){
    console.log("2. onCheckoutClick()");
    buildPaymentRequest();
}


/**
 * Handles the response from PaymentRequest.show().
 */
function handlePaymentResponse(response) {
    console.log("4. handlePaymentResponse()");
    //Check if the response.details.result is success
    //get the transaction ref id from the response
    //use transaction refId and merchant Id to fetch the status
    var fetchOptions = {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payloadForFetch)   
        };
        var serverPaymentRequest = new Request('secure/payment/endpoint');    //endpoint to fetch the status from server
        fetch(serverPaymentRequest, fetchOptions).then( fetchResponse => {
        if (fetchResponse.status < 400) {
            console.log("4. handlePaymentResponse() :: success");
            response.complete("success");     //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        } else {
            console.log("4. handlePaymentResponse() :: fail");
            response.complete("fail");        //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        };
        }).catch( reason => {
           console.log("CATCH: handlePaymentResponse() :: fail");
           response.complete("fail");          //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        });      
}

/**
 * Click event listener for “pay by Phonepe” button
 * Launch payment request for Phonepe payment.
 */
function onPayByPhonePeClick() { 
    console.log("2. onPayByPhonePeClick()");
    if (!window.PaymentRequest || !request) {
        return;
    }

    try {
    request.show()
        .then(handlePaymentResponse)
        .catch(function(err) {
        handleError(err);          //handle error
    });
    } catch (e) {
    handleError(e);
    }
}



const payButton = document.getElementById('buyButton');
payButton.setAttribute('style', 'display: none;');
if (window.PaymentRequest) {
  console.log("Main 1. Before onCheckoutClick()");
  onCheckoutClick();
  console.log("Main 2. After onCheckoutClick()");
  payButton.setAttribute('style', 'display: inline;');
  payButton.addEventListener('click', function() {
    console.log("Main 3. Before onPayByPhonePeClick()");
    onPayByPhonePeClick();
    console.log("Main 4. After onPayByPhonePeClick()");
    onCheckoutClick();
    console.log("Main 5. After onCheckoutClick()");
  });
} else {
  console.log("Main 1. ERROR");
  ChromeSamples.setStatus('This browser does not support web payments');
}
