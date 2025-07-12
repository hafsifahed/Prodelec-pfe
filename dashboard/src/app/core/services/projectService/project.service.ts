import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProjectDto } from '../../models/projectfo/project-dto';
import { Project } from '../../models/projectfo/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }


createProject(
  project: ProjectDto,
  idOrder: number,
  conceptionResponsible?: string,
  methodeResponsible?: string,
  productionResponsible?: string,
  finalControlResponsible?: string,
  deliveryResponsible?: string
) {
  let params = new HttpParams().set('idOrder', idOrder.toString());

  if (conceptionResponsible?.trim()) {
    params = params.set('conceptionResponsible', conceptionResponsible.trim());
  }
  if (methodeResponsible?.trim()) {
    params = params.set('methodeResponsible', methodeResponsible.trim());
  }
  if (productionResponsible?.trim()) {
    params = params.set('productionResponsible', productionResponsible.trim());
  }
  if (finalControlResponsible?.trim()) {
    params = params.set('finalControlResponsible', finalControlResponsible.trim());
  }
  if (deliveryResponsible?.trim()) {
    params = params.set('deliveryResponsible', deliveryResponsible.trim());
  }

  const url = `${environment.baseUrl}/projects`;
  return this.http.post(url, project, { params });
}

updateProject(
  projectId: number,
  updatedProject: ProjectDto,
  conceptionResponsible?: string,
  methodeResponsible?: string,
  productionResponsible?: string,
  finalControlResponsible?: string,
  deliveryResponsible?: string
) {
  let params = new HttpParams();

  if (conceptionResponsible?.trim()) {
    params = params.set('conceptionResponsible', conceptionResponsible.trim());
  }
  if (methodeResponsible?.trim()) {
    params = params.set('methodeResponsible', methodeResponsible.trim());
  }
  if (productionResponsible?.trim()) {
    params = params.set('productionResponsible', productionResponsible.trim());
  }
  if (finalControlResponsible?.trim()) {
    params = params.set('finalControlResponsible', finalControlResponsible.trim());
  }
  if (deliveryResponsible?.trim()) {
    params = params.set('deliveryResponsible', deliveryResponsible.trim());
  }

  const url = `${environment.baseUrl}/projects/${projectId}`;
  return this.http.put(url, updatedProject, { params });
}


  getAllProjects() {
    return this.http.get<Project[]>(`${environment.baseUrl}/projects`);
  }

  getProjectById(id: number) {
    const url = `${environment.baseUrl}/projects/${id}`;
    return this.http.get<Project>(url);
  }

  deleteProject(id: number) {
    const url = `${environment.baseUrl}/projects/${id}`;
    return this.http.delete(url);
  }

  getProjectsByUser(userId: number) {
    const url = `${environment.baseUrl}/projects/user/${userId}`;
    return this.http.get<Project[]>(url);
  }

  changeStatusConception(id: number) {
    const url = `${environment.baseUrl}/projects/statusc/${id}`;
    return this.http.put(url, {});
  }

  changeStatusConception1(id: number) {
    const url = `${environment.baseUrl}/projects/statusc1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusMethode(id: number) {
    const url = `${environment.baseUrl}/projects/statusm/${id}`;
    return this.http.put(url, {});
  }

  changeStatusMethode1(id: number) {
    const url = `${environment.baseUrl}/projects/statusm1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusProduction(id: number) {
    const url = `${environment.baseUrl}/projects/statusp/${id}`;
    return this.http.put(url, {});
  }

  changeStatusProduction1(id: number) {
    const url = `${environment.baseUrl}/projects/statusp1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusFC(id: number) {
    const url = `${environment.baseUrl}/projects/statusfc/${id}`;
    return this.http.put(url, {});
  }

  changeStatusFC1(id: number) {
    const url = `${environment.baseUrl}/projects/statusfc1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusDelivery(id: number) {
    const url = `${environment.baseUrl}/projects/statusd/${id}`;
    return this.http.put(url, {});
  }

  changeStatusDelivery1(id: number) {
    const url = `${environment.baseUrl}/projects/statusd1/${id}`;
    return this.http.put(url, {});
  }

  progressc(id: number,p:number) {
    const url = `${environment.baseUrl}/projects/progressc/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressm(id: number,p:number) {
    const url = `${environment.baseUrl}/projects/progressm/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressp(id: number,p:number) {
    const url = `${environment.baseUrl}/projects/progressp/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressfc(id: number,p:number) {
    const url = `${environment.baseUrl}/projects/progressfc/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressd(id: number,p:number) {
    const url = `${environment.baseUrl}/projects/progressd/${id}/${p}`;
    return this.http.put(url, {});
  }

  changeprogress(id: number) {
    const url = `${environment.baseUrl}/projects/progress/${id}`;
    return this.http.put(url, {});
  }

  archivera(id: number) {
    return this.http.put(`${environment.baseUrl}/projects/archivera/${id}`, {});
  }

  archiverc(id: number) {
    return this.http.put(`${environment.baseUrl}/projects/archiverc/${id}`, {});
  }

  changeRealc(id: number){
    const url = `${environment.baseUrl}/projects/realc/${id}`;
    return this.http.put(url,{});
  }

  changeRealm(id: number) {
    const url = `${environment.baseUrl}/projects/realm/${id}`;
    return this.http.put(url, {});
  }

  changeRealp(id: number){
    const url = `${environment.baseUrl}/projects/realp/${id}`;
    return this.http.put(url,{});
  }

  changeRealfc(id: number) {
    const url = `${environment.baseUrl}/projects/realfc/${id}`;
    return this.http.put(url, {});
  }

  changeReall(id: number) {
    const url = `${environment.baseUrl}/projects/reall/${id}`;
    return this.http.put(url,{});
  }
  getProjectsByPartner(partnerId: number) {
  return this.http.get<Project[]>(`${environment.baseUrl}/projects/partner/${partnerId}`);
}

}
