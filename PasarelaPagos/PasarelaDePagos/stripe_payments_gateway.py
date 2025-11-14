import os
import dotenv
import stripe

dotenv.load_dotenv()
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

stripe.api_key = STRIPE_SECRET_KEY
# Aca se crea el metodo de pago como una tarjeta de visa y 
# el except stripe es por si llega a tener error el metodo de pago.
def create_payment_method():
    try:
        payment_method = stripe.PaymentMethod.create(
            type="card",
            card={"token": "tok_visa"}
        )
        print(f"Método de pago creado: {payment_method.id}")

        return payment_method.id

    except stripe.error.StripeError as e:
        print(f"Error en Stripe: {e.user_message}")

# Aqui se crea el pago y se confirma automaticamente para prueba, cuando se le haga el pago se asociara al cliente con customer, 
# tambien se le agrega la cantidad o el amount, tampoco debo inventarme el currency, se debe aclarar en el codigo
def create_payment(client_id: str, payment_method_id: str, product_id: str, amount: int, currency: str):
    try:
        payment = stripe.PaymentIntent.create(
            amount=amount,  
            currency=currency,
            customer=client_id,
            payment_method=payment_method_id,
            payment_method_types=["card"],
            confirm=True,
            metadata={
                "product_id":product_id
            }
        )
        print(f"Pago con ID {payment.id} realizado correctamente")

    except stripe.error.CardError as e:
        print(f"Error en la tarjeta: {e.user_message}")
    except stripe.error.StripeError as e:
        print(f"Error en Stripe: {e.user_message}")

#creamos el usuario y lo retornamos
def create_user(name, email):
    try:
        client = stripe.Customer.create(
            name=name,
            email=email
        )
        print(f"Cliente {name} creado correctamente con ID {client.id}")
        return client.id

    except stripe.error.StripeError as e:
        print(f"Error en Stripe: {e.user_message}")

#se añade el pago directamente al usuario despues de
def add_payment_method_to_user(client_id, payment_method_id):
        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=client_id
        )
        
        print("Metodo de pago asociado al usuario")

#aca se obtendran los productos
def get_products():
    
    products = stripe.Product.list(limit=1)
    
    return products["data"][0]["id"]


#aca se obtendra el precio del producto, se necesitara el product_id o si no no funcionará 
def get_product_price(product_id):

    price = stripe.Price.list(product=product_id, limit=1)
    
    price_id = price["data"][0]["id"]
    amount = price["data"][0]["unit_amount"]
    currency = price["data"][0]["currency"]

    print(price)

    return price_id,amount,currency

#currency es la divisa cabe aclarar
  

product_id=get_products()
price_id, amount, currency = get_product_price(product_id)

client_id = create_user("Walter Cespedes", "waltersito2006@gmail.com" )

payment_method_id = create_payment_method()

add_payment_method_to_user(client_id,payment_method_id)

create_payment(client_id, payment_method_id, product_id, amount, currency)


