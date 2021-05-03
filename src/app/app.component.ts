import { Component } from '@angular/core';

interface IProduct {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
}

class OrderItem {
  constructor(
    public product: IProduct,
    public quantity: number,
    public purchasePrice: number
  ) { }
}

interface ICartItemsMap {
  [productId: string]: OrderItem;
}

const CARTITEMS = 'cartItems';

const items: OrderItem[] = [
  {
    product: {
      _id: '1',
      categoryId: '1',
      imageUrl: 'http://placeimg.com/128/128/animals',
      name: 'One',
      price: 0,
    },
    quantity: 1,
    purchasePrice: 0,
  },
  {
    product: {
      _id: '2',
      categoryId: '1',
      imageUrl: 'http://placeimg.com/128/128/nature',
      name: 'Two',
      price: 0,
    },
    quantity: 1,
    purchasePrice: 0,
  },
  {
    product: {
      _id: '3',
      categoryId: '1',
      imageUrl: 'http://placeimg.com/128/128/tech',
      name: 'Three',
      price: 0,
    },
    quantity: 1,
    purchasePrice: 0,
  },
];

@Component({
  selector: 'app-root',
  template: `
    <form>
      <mat-card *ngFor="let item of getAllItems()">
          <mat-card-header>
              <mat-card-title>{{item.product.name}}</mat-card-title>
              <mat-card-subtitle>{{item.product.price | currency}}</mat-card-subtitle>
              <img mat-card-avatar [src]="item.product.imageUrl" [alt]="item.product.name">
          </mat-card-header>
          <mat-card-content>
              <mat-form-field appearance="outline">
                  <mat-label>Quantity</mat-label>
                  <button mat-icon-button matPrefix type="button" (click)="item.quantity > 1 && setItem(item.product, item.quantity - 1)">
                      <mat-icon>remove_circle</mat-icon>
                  </button>
                  <input matInput type="number" [name]="item.product._id" [value]="item.quantity" min="1">
                  <button mat-icon-button matSuffix type="button" (click)="setItem(item.product, item.quantity + 1)">
                      <mat-icon>add_circle</mat-icon>
                  </button>
              </mat-form-field>
          </mat-card-content>
          <mat-card-actions>
              <button mat-icon-button color="warn">
                  <mat-icon>remove_shopping_cart</mat-icon>
              </button>
          </mat-card-actions>
      </mat-card>
      <mat-divider></mat-divider>
      <h2>Cart Total: {{getTotalPrice() | currency}}</h2>
      <div>
          <button type="submit">
              Check Out
          </button>
          <button type="reset">
              <mat-icon>remove_shopping_cart</mat-icon>
          </button>
      </div>
    </form>
  `,
  styles: [
    `mat-card { margin: 1rem 0; }`,
    `mat-card-content mat-form-field input { text-align: center; }`,
    `mat-card-content mat-form-field .mat-form-field-infix { width: unset; }`,
    `mat-card-actions { display: flex; justify-content: center; }`,
    `mat-card-content >>> .mat-form-field-infix { width: unset; }`,
  ],
})
export class AppComponent {
  constructor() {
    this.validateStoredCart();
    if (this.isEmpty()) {
      items.forEach((item) => this.setItem(item.product, item.quantity));
    }
  }

  getAllItems(): Array<OrderItem> {
    return Object.values(this.getCartItemsMap());
  }

  getTotalQuantity(): number {
    return this.getTotal((item) => item.quantity);
  }

  getTotalPrice(): number {
    return this.getTotal((item) => item.quantity * item.purchasePrice);
  }

  setItem(product: IProduct, quantity: number): void {
    const map = this.getCartItemsMap();
    if (quantity > 0) {
      map[product._id] = new OrderItem(product, quantity, product.price);
    } else {
      delete map[product._id];
    }
    this.setCartItemsMap(map);
  }

  empty(): void {
    this.setCartItemsMap({});
  }

  isEmpty(): boolean {
    return this.getTotal((item) => 1) === 0;
  }

  private getTotal(selectTerm: (item: OrderItem) => number): number {
    return Object.values(this.getCartItemsMap())
      .map(selectTerm)
      .reduce((total, term) => total + term, 0);
  }

  private getCartItemsMap(): ICartItemsMap {
    return JSON.parse(localStorage.getItem(CARTITEMS) || '{}');
  }

  private setCartItemsMap(map: ICartItemsMap): void {
    localStorage.setItem(CARTITEMS, JSON.stringify(map));
  }

  /**
   * Validate localStorage.cartItems; delete it if it doesn't conform to the expected structure.
   */
  private validateStoredCart(): void {
    const mapJson = localStorage.getItem(CARTITEMS);
    // tslint:disable-next-line: label-position
    test: {
      if (typeof mapJson === 'string') {
        const map = JSON.parse(mapJson);
        if (
          map &&
          typeof map === 'object' &&
          Object.getPrototypeOf(map) === Object.prototype
        ) {
          const items: Array<OrderItem> = Object.values(map);
          try {
            if (
              items.some(
                ({
                  product: { _id, name, price, imageUrl },
                  quantity,
                }) =>
                  typeof _id !== 'string' ||
                  typeof name !== 'string' ||
                  typeof price !== 'number' ||
                  typeof imageUrl !== 'string' ||
                  typeof quantity !== 'number'
              )
            ) {
              break test;
            }
          } catch (err) {
            break test;
          }
        } else {
          break test;
        }
      }
      return;
    }
    if (mapJson) {
      localStorage.removeItem(CARTITEMS);
    }
  }
}
