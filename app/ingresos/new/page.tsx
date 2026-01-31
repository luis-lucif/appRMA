"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea" // Need to install textarea or use Input
import { Upload, FileText, X } from "lucide-react"
import { createTicket } from "@/app/actions"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UploadButton } from "@/components/upload-button"


// If Textarea component doesn't exist, I'll use standard textarea with shadcn classes or Input
// Shadcn usually has textarea component. I'll assume it exists or use Input as fallback. 
// Actually I didn't install textarea. I installed input. I'll use a clear standard textarea with tailwind classes matching input.

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  clientPhone: z.string().min(6, {
    message: "El teléfono debe ser válido.",
  }),
  clientEmail: z.string().email({
     message: "Email inválido"
  }).optional().or(z.literal("")),
  productModel: z.string().min(2, {
    message: "Indica el modelo del equipo.",
  }),
  category: z.string().min(2, {
    message: "Indica la categoría (ej: Celular, Notebook).",
  }),
  faultDescription: z.string().min(5, {
    message: "Describe la falla detalladamente.",
  }),
  location: z.enum(["LIBERTAD", "LARRAZABAL", "CORREO"]),
  // Optional shipping fields
  shippingProvince: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingNotes: z.string().optional(),
  // File Upload
  purchaseInvoiceUrl: z.string().optional(),
})

export default function NewTicketPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      productModel: "",
      category: "",
      faultDescription: "",
      location: "LIBERTAD",
      shippingProvince: "",
      shippingCity: "",
      shippingAddress: "",
      shippingPostalCode: "",
      shippingNotes: "",
      purchaseInvoiceUrl: ""
    },
  })

  // State for preview
  const [invoiceUrl, setInvoiceUrl] = useState("")
  const [fileType, setFileType] = useState("image") // 'image' or 'pdf'

  const handleUploadComplete = (url: string, key: string, publicUrl: string) => {
    setInvoiceUrl(publicUrl)
    form.setValue("purchaseInvoiceUrl", publicUrl)
    
    // Simple extension check for preview type
    if (publicUrl.toLowerCase().endsWith(".pdf")) {
        setFileType("pdf")
    } else {
        setFileType("image")
    }
  }

  const handleRemoveFile = () => {
    setInvoiceUrl("")
    form.setValue("purchaseInvoiceUrl", "")
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await createTicket(values)
      if (result.error) {
        alert("Error: " + result.error) // Replace with toast in future
      } else {
        // alert("✅ Ticket Creado con Éxito! ID: " + result.ticketId) // Removed alert as requested
        router.push("/dashboard")
        router.refresh()
      }
    })
  }

  return (
    <div className="flex justify-center p-6">
       <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Nuevo Ingreso de Reparación</CardTitle>
          <CardDescription>Completa los datos del cliente y del equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Perez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 11 ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="clientEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="cliente@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos del Equipo</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Celular, Notebook, Consola" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="productModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input placeholder="iPhone 13, Dell Inspiron..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                 
                 <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación / Sucursal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona ubicación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LIBERTAD">Local Libertad</SelectItem>
                            <SelectItem value="LARRAZABAL">Local Larrazabal</SelectItem>
                            <SelectItem value="CORREO">Correo (Envío)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                 {form.watch("location") === "CORREO" && (
                    <div className="space-y-4 border rounded-md p-4 bg-muted/20 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                           📦 Datos de Envío
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="shippingProvince"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provincia</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Buenos Aires" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shippingCity"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localidad</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Mar del Plata" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="shippingAddress"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Av. Siempre Viva 123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="shippingPostalCode"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>C.P.</FormLabel>
                                    <FormControl>
                                    <Input placeholder="7600" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                    </div>
                 )}

                 <FormField
                    control={form.control}
                    name="faultDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción de la Falla</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detalle la falla reportada por el cliente..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("location") === "CORREO" && (
                    <FormField
                        control={form.control}
                        name="shippingNotes"
                        render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-top-2">
                            <FormLabel>Observaciones de Envío</FormLabel>
                            <FormControl>
                            <Input placeholder="Dejar en portería..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  )}

                  {/* File Upload Section */}
                  <div className="space-y-4">
                      <FormLabel>Factura de Compra / Comprobante</FormLabel>
                      
                      {!invoiceUrl ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors">
                             <UploadButton 
                                onUploadComplete={handleUploadComplete} 
                                label="Subir Archivo (JPG, PDF)"
                             />
                             <p className="text-xs text-muted-foreground mt-2">Formatos aceptados: JPG, PNG, PDF</p>
                        </div>
                      ) : (
                        <div className="relative rounded-lg border p-4 flex flex-col items-center bg-muted/20">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                                onClick={handleRemoveFile}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            
                            {fileType === 'pdf' ? (
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <FileText className="h-16 w-16 text-red-500" />
                                    <span className="text-sm font-medium">Documento PDF Cargado</span>
                                    <a href={invoiceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                        Ver Documento
                                    </a>
                                </div>
                            ) : (
                                <div className="relative w-full h-48 rounded overflow-hidden">
                                    {/* Using img tag directly for external R2 URL to avoid next/image config issues for now */}
                                    <img 
                                        src={invoiceUrl} 
                                        alt="Comprobante" 
                                        className="object-contain w-full h-full" 
                                    />
                                </div>
                            )}
                        </div>
                      )}
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Guardando..." : "Registrar Ingreso"}
                 </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
