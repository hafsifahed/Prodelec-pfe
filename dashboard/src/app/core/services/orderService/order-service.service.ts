import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../models/order/order';
import { environment } from 'src/environments/environment';
import { OrderDto } from '../../models/order/order-dto';
import { UserModel } from '../../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService {

  constructor(private http: HttpClient) { }

  getAllOrders(){
    return this.http.get<Order[]>(`${environment.baseUrl}/order`);
  }

  getAllOrdersworkers(){
    return this.http.get(`${environment.baseUrl}/workers`);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${environment.baseUrl}/order/${id}`);
  }

  addOrder(order: OrderDto, idUser: number) {
    return this.http.post(`${environment.baseUrl}/order/${idUser}`, order);
  }

  updateOrder(id: number, order: OrderDto) {
    return this.http.put(`${environment.baseUrl}/order/${id}`, order);
  }

  deleteOrder(id: number) {
    return this.http.delete(`${environment.baseUrl}/order/${id}`);
  }

  getOrdersByUser(userId: number) {
    return this.http.get<Order[]>(`${environment.baseUrl}/order/user/${userId}`);
  }

  changeStatus(id: number) {
    return this.http.put(`${environment.baseUrl}/order/status/${id}`, {});
  }

  archivera(id: number) {
    return this.http.put(`${environment.baseUrl}/order/archivera/${id}`, {});
  }

  archiverc(id: number) {
    return this.http.put(`${environment.baseUrl}/order/archiverc/${id}`, {});
  }

  upload(formData:FormData):Observable<HttpEvent<string>>{
    return this.http.post<string>(`${environment.baseUrl}/order/upload`,formData,{
      reportProgress:true,
      observe:'events'
    });
  }

  download(filename:string, user : UserModel):Observable<HttpEvent<Blob>>{
    return this.http.get(`${environment.baseUrl}/order/download/${filename}?email=${user.email}`,{
      reportProgress:true,
      observe:'events',
      responseType:'blob'
    });
  }

}
