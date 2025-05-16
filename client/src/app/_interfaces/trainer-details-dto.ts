export interface TrainerDetailsDto {
  profileImage: string;
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  status: string;
  roles: string[];
  dateRegister: string | Date;
  dateUpdate: string | Date;
}
