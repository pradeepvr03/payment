

let request;
 
/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
    if (!window.PaymentRequest) {
        return null;
    }

    const supportedInstruments = [{
        supportedMethods: "https://mercury-uat.phonepe.com/transact/pay",
        // For PreProd: "https://mercury-uat.phonepe.com/transact/pay",
        // For Prod: "https://mercury-t2.phonepe.com/transact/pay",

        data: {
            url: redirectUrl        //redirect url from v4/debit response
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
        request = new PaymentRequest(supportedInstruments, details);
        if (typeof request.hasEnrolledInstrument === 'function') {
            request.hasEnrolledInstrument().then(function(result) {
                if(result) {
                    console.log("Show “pay by Phonepe” button in payment options");
                    //Show “pay by Phonepe” button in payment options
                }
            }).catch(function(err) {
                handleError(err);     //handle error
            });
        } else {
            request.canMakePayment().then(function(result) {
            if(result) {
            //Show “pay by Phonepe” button in payment options
            }
        }).catch(function(err) {
            handleError(err);
        });
        }
        
    } catch (e) {
        handleError(e);
    }
}
  
/**
 * Create payment request object for Phonepe payment.
 */
function onCheckoutClick(){
    buildPaymentRequest();
}


/**
 * Handles the response from PaymentRequest.show().
 */
function handlePaymentResponse(response) {
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
            response.complete("success");     //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        } else {
            response.complete("fail");        //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        };
        }).catch( reason => {
        response.complete("fail");          //notifies the user agent that the user interaction is over, and causes any remaining user interface to be closed
        });      
}

/**
 * Click event listener for “pay by Phonepe” button
 * Launch payment request for Phonepe payment.
 */
function onPayByPhonePeClick() { 
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
  onCheckoutClick();
  payButton.setAttribute('style', 'display: inline;');
  payButton.addEventListener('click', function() {
    onPayByPhonePeClick();
    // onCheckoutClick();
  });
} else {
  ChromeSamples.setStatus('This browser does not support web payments');
}
