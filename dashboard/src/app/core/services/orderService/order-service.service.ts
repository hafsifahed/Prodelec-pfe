import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../models/order/order';
import { environment } from 'src/environments/environment';
import { OrderDto } from '../../models/order/order-dto';
import { User } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {

  constructor(private http: HttpClient) { }

  // Récupérer toutes les commandes
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.baseUrl}/order`);
  }

   getAllOrdersworkers(){
    return this.http.get(`${environment.baseUrl}/users/workers`);
  }

  // Récupérer une commande par son ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.baseUrl}/order/${id}`);
  }

  // Ajouter une commande pour un utilisateur
  addOrder(order: OrderDto, idUser: number): Observable<Order> {
    return this.http.post<Order>(`${environment.baseUrl}/order/${idUser}`, order);
  }

  // Modifier une commande existante
  updateOrder(id: number, order: OrderDto): Observable<Order> {
    return this.http.put<Order>(`${environment.baseUrl}/order/${id}`, order);
  }

  // Supprimer une commande
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/order/${id}`);
  }

  // Récupérer toutes les commandes d'un utilisateur
  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.baseUrl}/order/user/${userId}`);
  }

  // Changer le statut d'une commande
  changeStatus(id: number): Observable<Order> {
    return this.http.put<Order>(`${environment.baseUrl}/order/status/${id}`, {});
  }

  // Archiver une commande (type A)
  archivera(id: number): Observable<Order> {
    return this.http.put<Order>(`${environment.baseUrl}/order/archivera/${id}`, {});
  }

  // Archiver une commande (type C)
  archiverc(id: number): Observable<Order> {
    return this.http.put<Order>(`${environment.baseUrl}/order/archiverc/${id}`, {});
  }

 /** order-service.service.ts (extrait) */
upload(formData: FormData, username: string) {
  return this.http.post<{ filename: string }>(
    `${environment.baseUrl}/order/upload?username=${encodeURIComponent(username)}`,
    formData,
    { observe: 'events', reportProgress: true }
  );
}

download(fileName: string, username: string): Observable<HttpEvent<Blob>> {
  return this.http.get(`${environment.baseUrl}/order/download/${fileName}`, {
    params: { username },
    observe: 'events',              // ← flux d'événements
    responseType: 'blob',           // ← contenu attendu
    reportProgress: true
  });
}

getArchiveByUserRole(): Observable<Order[]> {
  return this.http.get<Order[]>(`${environment.baseUrl}/order/archive/user`);
}

}
